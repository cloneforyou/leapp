import puppeteer from 'puppeteer'

export const DEFAULT_INTERCEPT_RESOLUTION_PRIORITY = puppeteer.DEFAULT_INTERCEPT_RESOLUTION_PRIORITY

export class BrowserHandler {
  private browser: puppeteer.Browser

  constructor(private headlessMode: boolean) {
  }

  public async getBrowser(): Promise<puppeteer.Browser> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({headless: this.headlessMode})
     // this.browser.on('disconnected', this.getBrowser)
    }

    return this.browser
  }

  public async killBrowser(): Promise<void> {
    if (this.browser && this.browser.process() != null) {
      this.browser.removeAllListeners()
      this.browser.disconnect()
      this.browser.process()?.kill('SIGINT')
    }
  }
}
