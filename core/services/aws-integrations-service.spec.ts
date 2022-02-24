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

  test('remainingHours', () => {
    const awsIntegrationService = new AwsIntegrationsService(null, null, null);
    const integration = {
      accessTokenExpiration: '2022-02-24T10:30:00'
    } as any;
    (awsIntegrationService as any).getDate = () => new Date('2022-02-24T10:00:00');
    const remainingHours = awsIntegrationService.remainingHours(integration);
    expect(remainingHours).toBe('in 30 minutes');
  })

  test('getDate', () => {
    const awsIntegrationService = new AwsIntegrationsService(null, null, null);
    const time: Date = (awsIntegrationService as any).getDate();

    expect(time).toBeInstanceOf(Date);
    expect(time.getDay()).toBe(new Date().getDay());
  })

})
