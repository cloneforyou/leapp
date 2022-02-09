import { LeappBaseError } from '../../../errors/leapp-base-error'
import { LoggerLevel } from '../../logging-service'
import { constants } from '../../../models/constants'
import { Repository } from '../../repository'
import {
  GenerateSSOTokenResponse,
  RegisterClientResponse,
  StartDeviceAuthorizationResponse,
  VerificationResponse
} from './aws-sso-role-service'
import { IVerificationWindowService } from '../../../interfaces/i-verification-window.service'
import { BrowserWindowClosing } from '../../../interfaces/i-browser-window-closing'
import SSOOIDC, {
  CreateTokenRequest,
  RegisterClientRequest,
  StartDeviceAuthorizationRequest
} from 'aws-sdk/clients/ssooidc';

export class AwsSsoOidcService {
  private readonly listeners: BrowserWindowClosing[]
  private ssoOidc: SSOOIDC
  private generateSSOTokenResponse: GenerateSSOTokenResponse
  private setIntervalQueue: Array<any>
  private mainIntervalId: any
  private loginMutex: boolean
  private timeoutOccurred: boolean
  private interruptOccurred: boolean

  public constructor(private verificationWindowService: IVerificationWindowService, private repository: Repository) {
    this.listeners = []
    this.ssoOidc = null
    this.generateSSOTokenResponse = null
    this.setIntervalQueue = []
    this.loginMutex = false
    this.timeoutOccurred = false
    this.interruptOccurred = false
  }

  public getListeners(): BrowserWindowClosing[] {
    return this.listeners
  }

  public appendListener(listener: BrowserWindowClosing): void {
    this.listeners.push(listener)
  }

  public async login(configurationId: string | number, region: string, portalUrl: string): Promise<GenerateSSOTokenResponse> {
    if (!this.loginMutex && this.setIntervalQueue.length === 0) {
      this.loginMutex = true

      this.ssoOidc = new SSOOIDC({region})
      this.generateSSOTokenResponse = null
      this.setIntervalQueue = []
      this.timeoutOccurred = false
      this.interruptOccurred = false

      const registerClientResponse = await this.registerSsoOidcClient()
      const startDeviceAuthorizationResponse = await this.startDeviceAuthorization(registerClientResponse, portalUrl)
      const windowModality = this.repository.getAwsSsoConfiguration(configurationId).browserOpening
      const verificationResponse = await this.verificationWindowService.openVerificationWindow(registerClientResponse,
        startDeviceAuthorizationResponse, windowModality, () => this.closeVerificationWindow())
      try {
        this.generateSSOTokenResponse = await this.createToken(configurationId, verificationResponse)
      } catch (err) {
        this.loginMutex = false
        throw(err)
      }

      this.loginMutex = false
      return this.generateSSOTokenResponse
    } else if (!this.loginMutex && this.setIntervalQueue.length > 0) {
      return this.generateSSOTokenResponse
    } else {
      return new Promise((resolve, reject) => {
        const repeatEvery = 500 // 0.5 second, we can make these more speedy as they just check a variable, no external calls here

        const resolved = setInterval(async () => {
          if (this.interruptOccurred) {
            clearInterval(resolved)

            const resolvedIndex = this.setIntervalQueue.indexOf(resolved)
            this.setIntervalQueue.splice(resolvedIndex, 1)

            reject(new LeappBaseError('AWS SSO Interrupted', this, LoggerLevel.info, 'AWS SSO Interrupted.'))
          } else if (this.generateSSOTokenResponse) {
            clearInterval(resolved)

            const resolvedIndex = this.setIntervalQueue.indexOf(resolved)
            this.setIntervalQueue.splice(resolvedIndex, 1)

            resolve(this.generateSSOTokenResponse)
          } else if (this.timeoutOccurred) {
            clearInterval(resolved)

            const resolvedIndex = this.setIntervalQueue.indexOf(resolved)
            this.setIntervalQueue.splice(resolvedIndex, 1)

            reject(new LeappBaseError('AWS SSO Timeout', this, LoggerLevel.error, 'AWS SSO Timeout occurred. Please redo login procedure.'))
          }
        }, repeatEvery)

        this.setIntervalQueue.push(resolved)
      })
    }
  }

  public closeVerificationWindow() {
    this.loginMutex = false

    this.getListeners().forEach(listener => {
      listener.catchClosingBrowserWindow()
    })
  }

  private getAwsSsoOidcClient(): SSOOIDC {
    return this.ssoOidc
  }

  public interrupt() {
    clearInterval(this.mainIntervalId)
    this.interruptOccurred = true
    this.loginMutex = false
  }

  private async registerSsoOidcClient(): Promise<RegisterClientResponse> {
    const registerClientRequest: RegisterClientRequest = {clientName: 'leapp', clientType: 'public'}
    return await this.getAwsSsoOidcClient().registerClient(registerClientRequest).promise()
  }

  private async startDeviceAuthorization(registerClientResponse: RegisterClientResponse, portalUrl: string): Promise<StartDeviceAuthorizationResponse> {
    const startDeviceAuthorizationRequest: StartDeviceAuthorizationRequest = {
      clientId: registerClientResponse.clientId,
      clientSecret: registerClientResponse.clientSecret,
      startUrl: portalUrl
    }

    return await this.getAwsSsoOidcClient().startDeviceAuthorization(startDeviceAuthorizationRequest).promise()
  }

  private async createToken(configurationId: string | number, verificationResponse: VerificationResponse): Promise<GenerateSSOTokenResponse> {
    const createTokenRequest: CreateTokenRequest = {
      clientId: verificationResponse.clientId,
      clientSecret: verificationResponse.clientSecret,
      grantType: 'urn:ietf:params:oauth:grant-type:device_code',
      deviceCode: verificationResponse.deviceCode
    }

    let createTokenResponse
    if (this.repository.getAwsSsoConfiguration(configurationId).browserOpening === constants.inApp) {
      createTokenResponse = await this.getAwsSsoOidcClient().createToken(createTokenRequest).promise()
    } else {
      createTokenResponse = await this.waitForToken(createTokenRequest)
    }

    const expirationTime: Date = new Date(Date.now() + createTokenResponse.expiresIn * 1000)
    return {accessToken: createTokenResponse.accessToken, expirationTime}
  }

  private async waitForToken(createTokenRequest: CreateTokenRequest): Promise<any> {
    return new Promise((resolve, reject) => {
      const intervalInMilliseconds = 5000

      this.mainIntervalId = setInterval(() => {
        this.getAwsSsoOidcClient().createToken(createTokenRequest).promise().then(createTokenResponse => {
          clearInterval(this.mainIntervalId)
          resolve(createTokenResponse)
        }).catch(err => {
          if (err.toString().indexOf('AuthorizationPendingException') === -1) {
            // AWS SSO Timeout occurred
            clearInterval(this.mainIntervalId)
            this.timeoutOccurred = true
            reject(new LeappBaseError('AWS SSO Timeout', this, LoggerLevel.error, 'AWS SSO Timeout occurred. Please redo login procedure.'))
          }
        })
      }, intervalInMilliseconds)
    })
  }
}
