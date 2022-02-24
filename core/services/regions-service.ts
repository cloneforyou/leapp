import {SessionFactory} from './session-factory'
import {Repository} from './repository'
import {WorkspaceService} from './workspace-service'
import {Session} from '../models/session'
import {SessionStatus} from '../models/session-status'

export class RegionsService {

    constructor(private sessionFactory: SessionFactory, private repository: Repository,
                private workspaceService: WorkspaceService) {
    }

    public async changeRegion(session: Session, newRegion: string): Promise<void> {
        const sessionService = this.sessionFactory.getSessionService(session.type)
        const wasActive = session.status === SessionStatus.active
        if (wasActive) {
            await sessionService.stop(session.sessionId)
        }

        session.region = newRegion
        this.repository.updateSession(session.sessionId, session)
        this.workspaceService.updateSession(session.sessionId, session)

        if (wasActive) {
            await sessionService.start(session.sessionId)
        }
    }

    public getDefaultAwsRegion(): string {
        return this.repository.getDefaultRegion()
    }

    public changeDefaultAwsRegion(newDefaultRegion: string) {
        this.repository.updateDefaultRegion(newDefaultRegion)
    }
}
