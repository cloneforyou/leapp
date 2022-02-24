import {AwsIntegrationsService} from './aws-integrations-service'

describe('AwsIntegrationsService', () => {

    test('getIntegrations', () => {
        const expectedIntegrations = [{id: 1}]
        const repository = {
            listAwsSsoConfigurations: () => expectedIntegrations
        } as any

        const awsIntegrationsService = new AwsIntegrationsService(repository, null, null)

        const integrations = awsIntegrationsService.getIntegrations()

        expect(integrations).toBe(expectedIntegrations)
    })

    test('isOnline, token missing', () => {
        const awsIntegrationsService = new AwsIntegrationsService(null, null, null);
        (awsIntegrationsService as any).getDate = () => new Date('2022-02-24T10:00:00')

        const isOnline = awsIntegrationsService.isOnline({} as any)
        expect(isOnline).toBe(false)
    })

    test('isOnline, token expired', () => {
        const awsIntegrationsService = new AwsIntegrationsService(null, null, null);
        (awsIntegrationsService as any).getDate = () => new Date('2022-02-24T10:00:00')

        const integration = {
            accessTokenExpiration: '2022-02-24T10:00:00'
        } as any

        const isOnline = awsIntegrationsService.isOnline(integration)
        expect(isOnline).toBe(false)
    })

    test('isOnline, token not expired', () => {
        const awsIntegrationsService = new AwsIntegrationsService(null, null, null);
        (awsIntegrationsService as any).getDate = () => new Date('2022-02-24T10:00:00')

        const integration = {
            accessTokenExpiration: '2022-02-24T10:00:01'
        } as any

        const isOnline = awsIntegrationsService.isOnline(integration)
        expect(isOnline).toBe(true)
    })
})
