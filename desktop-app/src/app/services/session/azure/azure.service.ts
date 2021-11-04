import {Injectable} from '@angular/core';
import {WorkspaceService} from '../../workspace.service';
import {environment} from '../../../../environments/environment';
import {AppService} from '../../app.service';
import {ExecuteService} from '../../execute.service';
import {SessionService} from '../../session.service';
import {AzureSession} from '../../../../../../core/models/azure-session';
import {LeappExecuteError} from '../../../../../../core/errors/leapp-execute-error';
import {LeappParseError} from '../../../../../../core/errors/leapp-parse-error';
import {FileService} from '../../../../../../core/services/file-service';

export interface AzureSessionRequest {
  sessionName: string;
  region: string;
  subscriptionId: string;
  tenantId: string;
}

export interface AzureSessionToken {
  tokenType: string;
  expiresIn: number;
  expiresOn: string;
  resource: string;
  accessToken: string;
  refreshToken: string;
  oid: string;
  userId: string;
  isMRRT: boolean;
  _clientId: string;
  _authority: string;
}

@Injectable({
  providedIn: 'root'
})
export class AzureService extends SessionService {

  constructor(
    protected awsIamUserSessionUINotifier: WorkspaceService,
    private appService: AppService,
    private executeService: ExecuteService
  ) {
    super(awsIamUserSessionUINotifier);
  }

  create(sessionRequest: AzureSessionRequest): void {
    const session = new AzureSession(sessionRequest.sessionName, sessionRequest.region, sessionRequest.subscriptionId, sessionRequest.tenantId);
    this.awsIamUserSessionUINotifier.addSession(session);
  }

  async start(sessionId: string): Promise<void> {
    this.sessionLoading(sessionId);

    const session = this.awsIamUserSessionUINotifier.get(sessionId);

    // Try parse accessToken.json
    let accessTokensFile = this.parseAccessTokens();

    // extract accessToken corresponding to the specific tenant (if not present, require az login)
    let accessTokenExpirationTime;
    if(accessTokensFile) {
      accessTokenExpirationTime = this.extractAccessTokenExpirationTime(accessTokensFile, (session as AzureSession).tenantId);
    }

    if (!accessTokenExpirationTime) {
      try {
        await this.executeService.execute(`az login --tenant ${(session as AzureSession).tenantId} 2>&1`);
        accessTokensFile = this.parseAccessTokens();
        accessTokenExpirationTime = this.extractAccessTokenExpirationTime(accessTokensFile, (session as AzureSession).tenantId);
      } catch(err) {
        this.sessionDeactivated(sessionId);
        throw new LeappExecuteError(this, err.message);
      }
    }

    // if access token is expired
    if (new Date(accessTokenExpirationTime).getTime() < Date.now()) {
      try {
        await this.executeService.execute(`az account get-access-token --subscription ${(session as AzureSession).subscriptionId}`);
      } catch(err) {
        this.sessionDeactivated(sessionId);
        throw new LeappExecuteError(this, err.message);
      }
    }

    try {
      // az account set —subscription <xxx> 2>&1
      await this.executeService.execute(`az account set --subscription ${(session as AzureSession).subscriptionId} 2>&1`);
      // az configure —default location <region(location)>
      await this.executeService.execute(`az configure --default location=${(session as AzureSession).region} 2>&1`);
      // delete refresh token from accessTokens
      this.deleteRefreshToken();
    } catch(err) {
      this.sessionDeactivated(sessionId);
      throw new LeappExecuteError(this, err.message);
    }

    this.sessionActivate(sessionId);
    return Promise.resolve(undefined);
  }

  async rotate(sessionId: string): Promise<void> {
    return this.start(sessionId);
  }

  async stop(sessionId: string): Promise<void> {
    this.sessionLoading(sessionId);
    try {
      await this.executeService.execute(`az account clear 2>&1`);
      await this.executeService.execute(`az configure --defaults location='' 2>&1`);
    } catch(err) {
      throw new LeappExecuteError(this, err.message);
    } finally {
      this.sessionDeactivated(sessionId);
    }
  }

  async delete(sessionId: string): Promise<void> {
    try {
      await this.stop(sessionId);
      this.awsIamUserSessionUINotifier.removeSession(sessionId);
    } catch(error) {
      throw new LeappParseError(this, error.message);
    }
  }

  private extractAccessTokenExpirationTime(accessTokens: AzureSessionToken[], tenantId: string): string {
    const correctToken = accessTokens.find(accessToken => accessToken._authority.split('/')[1] === tenantId);
    return correctToken ? correctToken.expiresOn : undefined;
  }

  private deleteRefreshToken(): void {
    const accessTokensString = FileService.getInstance().readFileSync(`${this.appService.getOS().homedir()}/${environment.azureAccessTokens}`);
    let azureSessionTokens = JSON.parse(accessTokensString) as AzureSessionToken[];
    azureSessionTokens = azureSessionTokens.map(azureSessionToken => {
      delete azureSessionToken.refreshToken;
      return azureSessionToken;
    });
    FileService.getInstance().writeFileSync(`${this.appService.getOS().homedir()}/${environment.azureAccessTokens}`, JSON.stringify(azureSessionTokens));
  }

  private parseAccessTokens(): AzureSessionToken[] {
    if (!this.accessTokenFileExists()) {
      return undefined;
    }

    const accessTokensString = FileService.getInstance().readFileSync(`${this.appService.getOS().homedir()}/${environment.azureAccessTokens}`);
    return JSON.parse(accessTokensString) as AzureSessionToken[];
  }

  private accessTokenFileExists(): boolean {
    return FileService.getInstance().exists(`${this.appService.getOS().homedir()}/${environment.azureAccessTokens}`);
  }
}