import {Command} from '@oclif/core'
import {LeappCliService} from '../../service/leapp-cli-service'
import {Config} from '@oclif/core/lib/config/config'
import {Session} from '@noovolari/leapp-core/models/session'

export default class ChangeSessionRegion extends Command {
    static description = 'Change a session region'

    static examples = [
        `$leapp session change-region`
    ]

    constructor(argv: string[], config: Config, private leappCliService = new LeappCliService()) {
        super(argv, config)
    }

    async run(): Promise<void> {
        try {
            const selectedSession = await this.selectSession()
            const selectedRegion = await this.selectRegion(selectedSession)
            await this.changeSessionRegion(selectedSession, selectedRegion)
        } catch (error) {
            this.error(error instanceof Error ? error.message : `Unknown error: ${error}`)
        }
    }

    public async selectSession(): Promise<Session> {
        const availableSessions = this.leappCliService.repository.getSessions()

        const answer: any = await this.leappCliService.inquirer.prompt([{
            name: 'selectedSession',
            message: 'select a session',
            type: 'list',
            choices: availableSessions.map(session => ({name: session.sessionName, value: session}))
        }])
        return answer.selectedSession
    }

    public async selectRegion(session: Session): Promise<string> {
        const availableRegions = this.leappCliService.cloudProviderService.availableRegions(session.type)

        const answer: any = await this.leappCliService.inquirer.prompt([{
            name: 'selectedRegion',
            message: `current region is ${session.region}, select a new region`,
            type: 'list',
            choices: availableRegions.map(region => ({name: region.fieldName, value: region.fieldValue}))
        }])
        return answer.selectedRegion
    }

    public async changeSessionRegion(session: Session, newRegion: string): Promise<void> {
        this.leappCliService.regionsService.changeRegion(session, newRegion)
        this.log('session region changed')
    }
}
