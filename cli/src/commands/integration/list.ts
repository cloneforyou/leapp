import {CliUx, Command} from '@oclif/core'
import {LeappCliService} from '../../service/leapp-cli-service'
import {Config} from '@oclif/core/lib/config/config'

export default class ListIntegrations extends Command {
  static description = 'Show integrations list'
  static examples = [`$leapp integration list`]

  static flags = {
    ...CliUx.ux.table.flags()
  }

  constructor(argv: string[], config: Config, private leappCliService = new LeappCliService()) {
    super(argv, config)
  }

  async run(): Promise<void> {
    try {
      await this.showIntegrations()
    } catch (error) {
      this.error(error instanceof Error ? error.message : `Unknown error: ${error}`)
    }
  }

  private async showIntegrations(): Promise<void> {

    const {flags} = await this.parse(ListIntegrations)
    const data = this.leappCliService.awsIntegrationsService.getIntegrations().map(integration => {
      const isOnline = this.leappCliService.awsIntegrationsService.isOnline(integration)
      return {
        integrationName: integration.alias,
        portalUrl: integration.portalUrl,
        region: integration.region,
        status: isOnline ? 'Online' : 'Offline',
        expirationInHours: isOnline
          ? `Expiring ${this.leappCliService.awsIntegrationsService.remainingHours(integration)}`
          : '-'
      }
    }) as any as Record<string, unknown> []

    const columns = {
      integrationName: {header: 'Integration Name'},
      portalUrl: {header: 'Portal URL'},
      region: {header: 'Region'},
      status: {header: 'Status'},
      expirationInHours: {header: 'Expiration'}
    }

    CliUx.ux.table(data, columns, {...flags})
  }
}
