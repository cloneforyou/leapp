import * as Aws from 'aws-sdk'
import { LeappAwsStsError } from '../../../errors/leapp-aws-sts-error'
import { LeappParseError } from '../../../errors/leapp-parse-error'
import { LeappSamlError } from '../../../errors/leapp-saml-error'
import { IAwsAuthenticationService } from '../../../interfaces/i-aws-authentication.service'
import { ISessionNotifier } from '../../../interfaces/i-session-notifier'
import { AwsIamRoleFederatedSession } from '../../../models/aws-iam-role-federated-session'
import { CredentialsInfo } from '../../../models/credentials-info'
import { AwsCoreService } from '../../aws-core-service'
import { FileService } from '../../file-service'
import { Repository } from '../../repository'
import { AwsIamRoleFederatedSessionRequest } from './aws-iam-role-federated-session-request'
import { AwsSessionService } from './aws-session-service'

export interface ResponseHookDetails {
  uploadData: { bytes: any[] }[];
}

export class AwsIamRoleFederatedService extends AwsSessionService {
  constructor(iSessionNotifier: ISessionNotifier, repository: Repository, private fileService: FileService,
              private awsCoreService: AwsCoreService, private awsAuthenticationService: IAwsAuthenticationService,
              private samlRoleSessionDuration) {
    super(iSessionNotifier, repository)
  }

  static async extractSamlResponse(responseHookDetails: ResponseHookDetails) {
    let rawData = responseHookDetails.uploadData[0].bytes.toString()
    const n = rawData.lastIndexOf('SAMLResponse=')
    const n2 = rawData.lastIndexOf('&RelayState=')
    rawData = n2 !== -1 ? rawData.substring(n + 13, n2) : rawData.substring(n + 13)
    return decodeURIComponent(rawData)
  }

  static sessionTokenFromGetSessionTokenResponse(assumeRoleResponse: Aws.STS.AssumeRoleWithSAMLResponse): { sessionToken: any } {
    return {
      sessionToken: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        aws_access_key_id: assumeRoleResponse.Credentials.AccessKeyId.trim(),
        // eslint-disable-next-line @typescript-eslint/naming-convention
        aws_secret_access_key: assumeRoleResponse.Credentials.SecretAccessKey.trim(),
        // eslint-disable-next-line @typescript-eslint/naming-convention
        aws_session_token: assumeRoleResponse.Credentials.SessionToken.trim(),
      }
    }
  }

  async create(request: AwsIamRoleFederatedSessionRequest): Promise<void> {
    const session = new AwsIamRoleFederatedSession(
      request.sessionName,
      request.region,
      request.idpUrl,
      request.idpArn,
      request.roleArn,
      request.profileId)

    this.repository.addSession(session)
    this.iSessionNotifier?.addSession(session)
  }

  async applyCredentials(sessionId: string, credentialsInfo: CredentialsInfo): Promise<void> {
    const session = this.iSessionNotifier.getSessionById(sessionId)
    const profileName = this.repository.getProfileName((session as AwsIamRoleFederatedSession).profileId)
    const credentialObject = {}
    credentialObject[profileName] = {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      aws_access_key_id: credentialsInfo.sessionToken.aws_access_key_id,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      aws_secret_access_key: credentialsInfo.sessionToken.aws_secret_access_key,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      aws_session_token: credentialsInfo.sessionToken.aws_session_token,
      region: session.region
    }
    return await this.fileService.iniWriteSync(this.awsCoreService.awsCredentialPath(), credentialObject)
  }

  async deApplyCredentials(sessionId: string): Promise<void> {
    const session = this.iSessionNotifier.getSessionById(sessionId)
    const profileName = this.repository.getProfileName((session as AwsIamRoleFederatedSession).profileId)
    const credentialsFile = await this.fileService.iniParseSync(this.awsCoreService.awsCredentialPath())
    delete credentialsFile[profileName]
    return await this.fileService.replaceWriteSync(this.awsCoreService.awsCredentialPath(), credentialsFile)
  }

  async generateCredentials(sessionId: string): Promise<CredentialsInfo> {
    // Get the session in question
    const session = this.iSessionNotifier.getSessionById(sessionId)

    // Get idpUrl
    const idpUrl = this.repository.getIdpUrl((session as AwsIamRoleFederatedSession).idpUrlId)

    // Check if we need to authenticate
    let needToAuthenticate
    try {
      needToAuthenticate = await this.awsAuthenticationService.needAuthentication(idpUrl)
    } catch (err) {
      throw new LeappSamlError(this, err.message)
    } finally {
      await this.awsAuthenticationService.closeBrowser()
    }

    // AwsSignIn: retrieve the response hook
    let responseHookDetails
    try {
      responseHookDetails = await this.awsAuthenticationService.awsSignIn(idpUrl, needToAuthenticate)
    } catch (err) {
      throw new LeappParseError(this, err.message)
    } finally {
      await this.awsAuthenticationService.closeBrowser()
    }

    // Extract SAML response from responseHookDetails
    let samlResponse
    try {
      samlResponse = await AwsIamRoleFederatedService.extractSamlResponse(responseHookDetails)
    } catch (err) {
      throw new LeappParseError(this, err.message)
    }

    // Setup STS to generate the credentials
    const sts = new Aws.STS(this.awsCoreService.stsOptions(session))

    // Params for the calls
    const params = {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      PrincipalArn: (session as AwsIamRoleFederatedSession).idpArn,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      RoleArn: (session as AwsIamRoleFederatedSession).roleArn,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      SAMLAssertion: samlResponse,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      DurationSeconds: this.samlRoleSessionDuration,
    }

    // Invoke assumeRoleWithSAML
    let assumeRoleWithSamlResponse: Aws.STS.AssumeRoleWithSAMLResponse
    try {
      assumeRoleWithSamlResponse = await sts.assumeRoleWithSAML(params).promise()


    } catch (err) {
      throw new LeappAwsStsError(this, err.message)
    }

    // Generate credentials
    return AwsIamRoleFederatedService.sessionTokenFromGetSessionTokenResponse(assumeRoleWithSamlResponse)
  }

  removeSecrets(sessionId: string): void {
  }
}
