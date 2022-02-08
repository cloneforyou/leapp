export interface IAwsAuthenticationService {
  needAuthentication(idpUrl: string): Promise<boolean>

  awsSignIn(idpUrl: string, needToAuthenticate: boolean): Promise<any>

  closePage(number: number): Promise<void>

  closeBrowser(): Promise<void>
}
