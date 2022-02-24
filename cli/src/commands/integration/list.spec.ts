import ListIntegrations from './list'
import {CliUx} from '@oclif/core'
import {describe, expect, jest, test} from '@jest/globals'

describe('ListIntegrations', () => {

  test('run', async () => {
    const command = new ListIntegrations([], {} as any) as any
    command.showIntegrations = jest.fn()
    await command.run()

    expect(command.showIntegrations).toHaveBeenCalled()
  })

  test('run - showIntegrations throw an error', async () => {
    const command = new ListIntegrations([], {} as any, {} as any) as any
    command.showIntegrations = jest.fn(async () => {
      throw Error('error')
    })
    try {
      await command.run()
    } catch (error) {
      expect(error).toEqual(new Error('error'))
    }
  })

  test('run - showIntegrations throw an object', async () => {
    const command = new ListIntegrations([], {} as any, {} as any) as any
    command.showIntegrations = jest.fn(async () => {
      throw 'string'
    })
    try {
      await command.run()
    } catch (error) {
      expect(error).toEqual(new Error('Unknown error: string'))
    }
  })

  test('showIntegrations', async () => {
    const integrations = [{
      alias: "integrationName",
      portalUrl: "portalUrl",
      region: "region",
      accessTokenExpiration: "expiration",
    }]
    const leapCliService = {
      awsIntegrationsService: {
        getIntegrations: () => integrations,
        isOnline: jest.fn(() => true),
        remainingHours: jest.fn(() => 'remainingHours')
      },
    }

    const command = new ListIntegrations([], {} as any, leapCliService as any) as any
    const tableSpy = jest.spyOn(CliUx.ux, 'table')

    await command.showIntegrations()


    const expectedData = [{
      integrationName: "integrationName",
      portalUrl: "portalUrl",
      region: "region",
      status: 'Online',
      expirationInHours: 'Expiring remainingHours'
    }]

    expect(tableSpy.mock.calls[0][0]).toEqual(expectedData)

    expect(leapCliService.awsIntegrationsService.isOnline).toHaveBeenCalledWith(integrations[0])
    expect(leapCliService.awsIntegrationsService.remainingHours).toHaveBeenCalledWith(integrations[0])

    const expectedColumns = {
      integrationName: {header: 'Integration Name'},
      portalUrl: {header: 'Portal URL'},
      region: {header: 'Region'},
      status: {header: 'Status'},
      expirationInHours: {header: 'Expiration'}
    }
    expect(tableSpy.mock.calls[0][1]).toEqual(expectedColumns)

  })
})
