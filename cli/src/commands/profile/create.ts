import {Command} from '@oclif/core'
import {LeappCliService} from '../../service/leapp-cli-service'
import {Config} from '@oclif/core/lib/config/config'

export default class CreateNamedProfile extends Command {
    static description = 'Create a new AWS named profile'

    static examples = [
        `$leapp profile create`
    ]

    constructor(argv: string[], config: Config, private leappCliService = new LeappCliService()) {
        super(argv, config)
    }

    async run(): Promise<void> {
        try {
            const profileName = await this.getProfileName()
            this.createNamedProfile(profileName)
        } catch (error) {
            this.error(error instanceof Error ? error.message : `Unknown error: ${error}`)
        }
    }

    public async getProfileName(): Promise<string> {
        const answer: any = await this.leappCliService.inquirer.prompt([{
            name: 'namedProfileName',
            message: `choose a name for the profile`,
            type: 'input'
        }])
        return answer.namedProfileName
    }

    public createNamedProfile(profileName: string) {
        this.leappCliService.namedProfilesService.createNamedProfile(profileName)
        this.log('profile created')
    }
}