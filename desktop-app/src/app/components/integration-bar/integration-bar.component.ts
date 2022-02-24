import {Component, OnDestroy, OnInit, QueryList, TemplateRef, ViewChild, ViewChildren} from '@angular/core';
import {globalFilteredSessions} from '../command-bar/command-bar.component';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {AppService} from '../../services/app.service';
import {Router} from '@angular/router';
import {formatDistance, isPast} from 'date-fns';
import {BsModalRef, BsModalService} from 'ngx-bootstrap/modal';
import {BehaviorSubject} from 'rxjs';
import {MatMenuTrigger} from '@angular/material/menu';
import {LeappCoreService} from '../../services/leapp-core.service';
import {MessageToasterService, ToastLevel} from '../../services/message-toaster.service';
import {WindowService} from '../../services/window.service';
import {AwsSsoIntegration} from '@noovolari/leapp-core/models/aws-sso-integration';
import {constants} from '@noovolari/leapp-core/models/constants';
import {AwsSsoRoleSession} from '@noovolari/leapp-core/models/aws-sso-role-session';
import {SsoRoleSession} from '@noovolari/leapp-core/services/session/aws/aws-sso-role-service';
import {LoggerLevel} from '@noovolari/leapp-core/services/logging-service';

export interface SelectedIntegration {
  id: string;
  selected: boolean;
}

export const integrationsFilter = new BehaviorSubject<AwsSsoIntegration[]>([]);
export const openIntegrationEvent = new BehaviorSubject<boolean>(false);
export const syncAllEvent = new BehaviorSubject<boolean>(false);

@Component({
  selector: 'app-integration-bar',
  templateUrl: './integration-bar.component.html',
  styleUrls: ['./integration-bar.component.scss']
})
export class IntegrationBarComponent implements OnInit, OnDestroy {

  @ViewChildren(MatMenuTrigger)
  triggers: QueryList<MatMenuTrigger>;

  @ViewChild('ssoModalTemplate', { static: false })
  ssoModalTemplate: TemplateRef<any>;

  eConstants = constants;
  regions = [];
  selectedAwsSsoConfiguration: AwsSsoIntegration;
  loadingInBrowser = false;
  loadingInApp = false;
  chooseIntegration = false;
  awsSsoConfigurations: AwsSsoIntegration[];
  modifying: number;
  subscription;
  subscription2;
  subscription3;

  form = new FormGroup({
    alias: new FormControl('', [Validators.required]),
    portalUrl: new FormControl('', [Validators.required, Validators.pattern('https?://.+')]),
    awsRegion: new FormControl('', [Validators.required]),
    defaultBrowserOpening: new FormControl('', [Validators.required])
  });

  logoutLoadings: any;
  selectedIntegrations: SelectedIntegration[];
  modalRef: BsModalRef;
  menuX: number;
  menuY: number;

  constructor(private appService: AppService,
              private bsModalService: BsModalService,
              private router: Router,
              private windowService: WindowService,
              private toasterService: MessageToasterService,
              private leappCoreService: LeappCoreService) { }

  public ngOnInit(): void {
    this.subscription = integrationsFilter.subscribe(() => {
      this.setValues();
      this.selectedIntegrations = this.awsSsoConfigurations.map((awsIntegration) => ({ id: awsIntegration.id, selected: false }));
    });
    integrationsFilter.next(this.leappCoreService.repository.listAwsSsoConfigurations());

    this.subscription2 = openIntegrationEvent.subscribe((value) => {
      if(value) {
        this.gotoForm(1, this.selectedAwsSsoConfiguration);
      }
    });

    this.subscription3 = syncAllEvent.subscribe(async (value) => {
      if(value) {
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < this.awsSsoConfigurations.length; i++) {
          const integration = this.awsSsoConfigurations[i];
          if(this.isOnline(integration)) {
             await this.forceSync(integration.id);
          }
        }
        this.toasterService.toast('Integrations synchronized.', ToastLevel.info, '');
      }
    });

    this.leappCoreService.awsSsoOidcService.getListeners().push(this);
    this.loadingInBrowser = false;
    this.loadingInApp = false;
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.subscription2.unsubscribe();
    this.subscription3.unsubscribe();
  }

  public selectedSsoConfigurationCheck(awsSsoConfiguration: AwsSsoIntegration): string {
    const index = this.selectedIntegrations.findIndex((s) => s.id === awsSsoConfiguration.id);
    return this.selectedIntegrations[index].selected ? 'selected-integration' : '';
  }

  public applyContextMenu(index: number, awsSsoConfiguration: AwsSsoIntegration, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    this.appService.closeAllMenuTriggers();

    this.selectedIntegrations.forEach((s) => s.selected = false);

    const selectedIndex = this.selectedIntegrations.findIndex((s) => s.id === awsSsoConfiguration.id);
    this.selectedIntegrations[selectedIndex].selected = true;

    setTimeout(() => {
      this.menuY = (event as any).layerY - 10;
      this.menuX = (event as any).layerX - 10;

      this.triggers.get(index).openMenu();
      this.appService.setMenuTrigger(this.triggers.get(index));
    }, 100);
  }

  public applySegmentFilter(awsSsoConfiguration: AwsSsoIntegration, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    this.selectedIntegrations.forEach((s) => s.selected = false);

    const selectedIndex = this.selectedIntegrations.findIndex((s) => s.id === awsSsoConfiguration.id);
    this.selectedIntegrations[selectedIndex].selected = true;

    globalFilteredSessions.next(
      this.leappCoreService.repository.getSessions().filter(
        (s) => (s as AwsSsoRoleSession).awsSsoConfigurationId === awsSsoConfiguration.id
      )
    );
  }

  public async logout(configurationId: string): Promise<void> {
    this.logoutLoadings[configurationId] = true;
    this.selectedAwsSsoConfiguration = this.leappCoreService.repository.getAwsSsoConfiguration(configurationId);
    await this.leappCoreService.awsSsoRoleService.logout(this.selectedAwsSsoConfiguration.id);

    this.loadingInBrowser = false;
    this.loadingInApp = false;
    this.setValues();
  }

  public async forceSync(configurationId: string): Promise<void> {
    this.selectedAwsSsoConfiguration = this.leappCoreService.repository.getAwsSsoConfiguration(configurationId);

    if (this.selectedAwsSsoConfiguration && !this.loadingInApp) {
      this.loadingInBrowser = (this.selectedAwsSsoConfiguration.browserOpening === constants.inBrowser.toString());
      this.loadingInApp = (this.selectedAwsSsoConfiguration.browserOpening === constants.inApp.toString());

      if(this.loadingInBrowser && !this.isOnline(this.selectedAwsSsoConfiguration)) {
        this.modalRef = this.bsModalService.show(this.ssoModalTemplate, { class: 'sso-modal'});
      }

      try {
        const ssoRoleSessions: SsoRoleSession[] = await this.leappCoreService.awsSsoRoleService.sync(configurationId);
        ssoRoleSessions.forEach((ssoRoleSession: SsoRoleSession) => {
          ssoRoleSession.awsSsoConfigurationId = configurationId;
          this.leappCoreService.awsSsoRoleService.create(ssoRoleSession);
        });

        if(this.modalRef) {
          this.modalRef.hide();
        }

        this.loadingInBrowser = false;
        this.loadingInApp = false;
      } catch (err) {
        await this.logout(configurationId);
        throw err;
      }
    }
  }

  public async gotoWebForm(integrationId: string): Promise<void> {
    // TODO: check if we need to put this method in IntegrationService singleton - sync method
    this.leappCoreService.awsSsoOidcService.interrupt();
    await this.forceSync(integrationId);
  }

  public setValues(): void {
    this.modifying = 0;
    this.regions = this.leappCoreService.awsCoreService.getRegions();
    this.regions = this.leappCoreService.awsCoreService.getRegions();
    this.awsSsoConfigurations = this.leappCoreService.repository.listAwsSsoConfigurations();
    this.logoutLoadings = {};
    this.awsSsoConfigurations.forEach((sc) => {
      this.logoutLoadings[sc.id] = false;
    });

    this.selectedAwsSsoConfiguration = {
      id: 'new AWS Single Sign-On',
      alias: '',
      region: this.regions[0].region,
      portalUrl: '',
      browserOpening: constants.inApp,
      accessTokenExpiration: undefined
    };
  }

  public closeLoadingScreen(): void {
    // TODO: call aws sso oidc service directly
    this.leappCoreService.awsSsoOidcService.interrupt();
    this.loadingInBrowser = false;
    this.loadingInApp = false;
    this.modalRef.hide();
  }

  public catchClosingBrowserWindow(): void {
    this.loadingInBrowser = false;
    this.loadingInApp = false;
    this.modalRef.hide();
  }

  public gotoForm(modifying: number, currentAwsSsoConfiguration: AwsSsoIntegration): void {
    // Change graphical values to show the form
    this.chooseIntegration = false;
    this.modifying = modifying;
    this.selectedAwsSsoConfiguration = currentAwsSsoConfiguration;

    if(modifying === 1) {
      this.selectedAwsSsoConfiguration = {
        id: 'new AWS Single Sign-On',
        alias: '',
        region: this.regions[0].region,
        portalUrl: '',
        browserOpening: constants.inApp,
        accessTokenExpiration: undefined
      };
    }

    this.form.get('alias').setValue(this.selectedAwsSsoConfiguration.alias);
    this.form.get('portalUrl').setValue(this.selectedAwsSsoConfiguration.portalUrl);
    this.form.get('awsRegion').setValue(this.selectedAwsSsoConfiguration.region);
    this.form.get('defaultBrowserOpening').setValue(this.selectedAwsSsoConfiguration.browserOpening);

    this.modalRef = this.bsModalService.show(this.ssoModalTemplate, { class: 'sso-modal'});
  }

  public save(): void {
    if(this.form.valid) {
      const alias = this.form.get('alias').value;
      const portalUrl = this.form.get('portalUrl').value;
      const region = this.form.get('awsRegion').value;
      const browserOpening = this.form.get('defaultBrowserOpening').value;

      if(this.modifying === 1) {
        // Save
        this.leappCoreService.repository.addAwsSsoIntegration(
          portalUrl,
          alias,
          region,
          browserOpening
        );
      } else if(this.modifying === 2 && this.selectedAwsSsoConfiguration.portalUrl !== '') {
        // Edit
        this.leappCoreService.repository.updateAwsSsoIntegration(
          this.selectedAwsSsoConfiguration.id,
          alias,
          region,
          portalUrl,
          browserOpening
        );
      }
      integrationsFilter.next(this.leappCoreService.repository.listAwsSsoConfigurations());
      this.modalRef.hide();
    } else {
      this.toasterService.toast('Form is not valid', ToastLevel.warn, 'Form validation');
    }
  }

  public delete(awsSsoConfiguration: AwsSsoIntegration): void {
    // Ask for deletion
    // eslint-disable-next-line max-len
    this.windowService.confirmDialog(`Deleting this configuration will also logout from its sessions: do you wannt to proceed?`, async (res) => {
      if (res !== constants.confirmClosed) {
        // eslint-disable-next-line max-len
        this.leappCoreService.loggingService.logger(`Removing sessions with attached aws sso config id: ${awsSsoConfiguration.id}`, LoggerLevel.info, this);
        await this.logout(awsSsoConfiguration.id);
        this.leappCoreService.repository.deleteAwsSsoIntegration(awsSsoConfiguration.id);
        this.modifying = 0;
      }
    }, 'Delete Configuration', 'Cancel');
  }

  public isOnline(awsSsoConfiguration: AwsSsoIntegration): boolean {
    return (awsSsoConfiguration.accessTokenExpiration !== null &&
        awsSsoConfiguration.accessTokenExpiration !== undefined &&
        awsSsoConfiguration.accessTokenExpiration !== '') &&
      !isPast(new Date(awsSsoConfiguration.accessTokenExpiration));
  }

  public remainingHours(awsSsoConfiguration: AwsSsoIntegration): string {
    return formatDistance(
      new Date(awsSsoConfiguration.accessTokenExpiration),
      new Date(),
      { addSuffix: true }
    );
  }
}
