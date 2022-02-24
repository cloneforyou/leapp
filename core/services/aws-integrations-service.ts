import {Repository} from './repository'
import {AwsSsoOidcService} from './session/aws/aws-sso-oidc.service'
import {AwsSsoRoleService} from './session/aws/aws-sso-role-service'
import {AwsSsoIntegration} from '../models/aws-sso-integration'
import {formatDistance} from 'date-fns'

export class AwsIntegrationsService {

    constructor(private repository: Repository,
                private awsSsoOidcService: AwsSsoOidcService,
                private awsSsoRoleService: AwsSsoRoleService) {
    }

    public getIntegrations(): AwsSsoIntegration[] {
        return this.repository.listAwsSsoConfigurations()
    }

    public isOnline(integration: AwsSsoIntegration): boolean {
        const expiration = new Date(integration.accessTokenExpiration).getTime()
        const now = this.getDate().getTime()
        return !!integration.accessTokenExpiration && now < expiration
    }

    public remainingHours(integration: AwsSsoIntegration): string {
        return formatDistance(new Date(integration.accessTokenExpiration), new Date(), {addSuffix: true})
    }

    private getDate(): Date {
        return new Date()
    }
}
