import {Command} from '@oclif/core'
import {LeappCliService} from '../../service/leapp-cli-service'
import {Config} from '@oclif/core/lib/config/config'
import {Session} from '@noovolari/leapp-core/models/session'
import {IdpUrl} from '@noovolari/leapp-core/models/IdpUrl'

export default class DeleteIdpUrl extends Command {
    static description = 'Delete an identity provider URL'

    static examples = [
        `$leapp idp-url delete`
    ]

    constructor(argv: string[], config: Config, private leappCliService = new LeappCliService()) {
        super(argv, config)
    }

    async run(): Promise<void> {
        try {
            const selectedIdpUrl = await this.selectIdpUrl()
            const affectedSessions = this.getAffectedSessions(selectedIdpUrl.id)
            if (await this.askForConfirmation(affectedSessions)) {
                await this.deleteIdpUrl(selectedIdpUrl.id)
            }
        } catch (error) {
            this.error(error instanceof Error ? error.message : `Unknown error: ${error}`)
        }
    }

    public async selectIdpUrl(): Promise<IdpUrl> {
        const idpUrls = this.leappCliService.idpUrlsService.getIdpUrls()
        if (idpUrls.length === 0) {
            throw new Error('no identity provider URLs available')
        }
        const answer: any = await this.leappCliService.inquirer.prompt([{
            name: 'selectedIdUrl',
            message: 'select an identity provider URL to delete',
            type: 'list',
            choices: idpUrls.map(idpUrl => ({name: idpUrl.url, value: idpUrl}))
        }])
        return answer.selectedIdUrl
    }

    public getAffectedSessions(idpUrlId: string): Session[] {
        return this.leappCliService.idpUrlsService.getDependantSessions(idpUrlId)
    }

    public async askForConfirmation(affectedSessions: Session[]): Promise<boolean> {
        if (affectedSessions.length === 0) {
            return true
        }
        const sessionsList = affectedSessions.map(session => `- ${session.sessionName}`).join('\n')
        const answer: any = await this.leappCliService.inquirer.prompt([{
            name: 'confirmation',
            message: `deleting this identity provider URL will delete also these sessions\n${sessionsList}\nDo you want to continue?`,
            type: 'confirm'
        }])
        return answer.confirmation
    }

    public async deleteIdpUrl(id: string) {
        await this.leappCliService.idpUrlsService.deleteIdpUrl(id)
        this.log('identity provider URL deleted')
    }
}