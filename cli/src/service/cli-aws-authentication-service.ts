import { IAwsAuthenticationService } from '@noovolari/leapp-core/interfaces/i-aws-authentication.service'
import puppeteer from 'puppeteer'


export class CliAwsAuthenticationService implements IAwsAuthenticationService {


  private browser: puppeteer.Browser
  private browser2: puppeteer.Browser
 // private browserEndpoint: any


  async needAuthentication(idpUrl: string): Promise<boolean> {
    return new Promise(async (resolve, reject) => {

      // this.browserHandler = new BrowserHandler(false)
      // const browser = await this.browserHandler.getBrowser()
      this.browser = await puppeteer.launch({headless: true})
     // this.browserEndpoint = this.browser.wsEndpoint()
      const page = await this.browser.newPage()
      await page.setDefaultNavigationTimeout(0)
      await page.setRequestInterception(true)

      page.on('request', request => {
        const requestUrl = request.url().toString()
        if (request.isInterceptResolutionHandled()) {
          reject('request unexpectedly already handled')
        }

        if (this.isRequestToIntercept(requestUrl)) {
          request.abort();
          resolve(requestUrl.indexOf('https://signin.aws.amazon.com/saml') === -1)
        } else {
          request.continue()
        }
      })

      try {
        await page.goto(idpUrl)
      }catch (e) {

      }


    })
  }

  public async awsSignIn(idpUrl: string, needToAuthenticate: boolean): Promise<any> {

    return new Promise(async (resolve, reject) => {
      // this.browserHandler = new BrowserHandler(!needToAuthenticate)
      //const browserWSEndpoint = this.browserEndpoint
       this.browser2 = await puppeteer.launch({headless: !needToAuthenticate})
      const page = await this.browser2.newPage()
      await page.setDefaultNavigationTimeout(0)
      await page.setRequestInterception(true)

      page.on('request', request => {
        const requestUrl = request.url().toString()
        if (request.isInterceptResolutionHandled()) {

          reject('request unexpectedly already handled')
        }

        if (requestUrl.indexOf('https://signin.aws.amazon.com/saml') !== -1) {
          request.abort();
          resolve({uploadData: [{bytes: {toString: () => request.postData()}}]})
        } else {
          request.continue()
        }
      })

      console.log('before goto')
      await page.goto(idpUrl)
    })
  }

  async closePage(number :number): Promise<void> {
    if (this.browser) {
      const pages = await this.browser.pages()

      for (let i =0; i<number;i++){
        pages[i].removeAllListeners()
       await pages[i].close()
      }
    }
  }
  async closeBrowser():Promise<void>{
    if(this.browser){
      this.browser.removeAllListeners()
      this.browser.disconnect()
     await this.browser.close()
    }
    if(this.browser2){
      this.browser2.removeAllListeners()
      this.browser2.disconnect()
      await this.browser2.close()
    }
  }

  private isRequestToIntercept(requestUrl: string): boolean {
    if (requestUrl.indexOf('https://login.microsoftonline.com') !== -1 &&
      requestUrl.indexOf('/oauth2/authorize') !== -1) {
      return true
    }

    const otherFilters = [
      '.onelogin.com/login',
      '.okta.com/discovery/iframe.html',
      'https://accounts.google.com/ServiceLogin',
      'https://signin.aws.amazon.com/saml'
    ]

    return otherFilters.some(filter => requestUrl.indexOf(filter) !== -1)
  }
}
