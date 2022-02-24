import {Command} from '@oclif/core'
import {LeappCliService} from '../../service/leapp-cli-service'
import {Config} from '@oclif/core/lib/config/config'

export default class GetDefaultRegion extends Command {
    static description = 'Displays the default region'

    static examples = [
        `$leapp region get-default`
    ]

    constructor(argv: string[], config: Config, private leappCliService = new LeappCliService()) {
        super(argv, config)
    }

    async run(): Promise<void> {
        const defaultAwsRegion = this.leappCliService.regionsService.getDefaultAwsRegion()
        this.log(defaultAwsRegion)
    }
}
