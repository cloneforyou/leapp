import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AppService} from '../../../services/app.service';
import {LoggingService} from '../../../services/logging.service';
import {WorkspaceService} from '../../../services/workspace.service';
import {FormControl, FormGroup} from '@angular/forms';
import Segment from '../../../models/Segment';
import {globalFilterGroup} from '../../command-bar/command-bar.component';
import {NgSelectComponent} from '@ng-select/ng-select';

@Component({
  selector: 'app-segment-dialog',
  templateUrl: './segment-dialog.component.html',
  styleUrls: ['./segment-dialog.component.scss']
})
export class SegmentDialogComponent implements OnInit, OnDestroy {

  @ViewChild('ngSelectComponent')
  ngSelectComponent: NgSelectComponent;

  form = new FormGroup({
    segmentName: new FormControl('')
  });

  selectedSegment;
  segments: Segment[];

  currentFilterGroup;
  temporaryName;

  private subscription;

  constructor(
    private appService: AppService,
    private loggingService: LoggingService,
    private workspaceService: WorkspaceService
  ) {
    this.temporaryName = '';
    this.segments = [...workspaceService.getSegments()];
    this.subscription = globalFilterGroup.subscribe(value => this.currentFilterGroup = value);
  }

  ngOnInit(): void {
    console.log(this.currentFilterGroup);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  addNewSegment(): void {
    const newSegment = { name: this.temporaryName, filterGroup: this.currentFilterGroup };
    console.log(newSegment);
    this.selectedSegment = newSegment;
    this.segments.push(newSegment);
    this.segments = [...this.segments];
    this.ngSelectComponent.handleClearClick();
  }

  saveSegment() {
    const segments = this.workspaceService.getSegments();
    const index = segments.findIndex(s => s.name.indexOf(this.selectedSegment.name) > -1);
    if(index === -1) {
      segments.push({ name: this.selectedSegment.name, filterGroup: this.currentFilterGroup });
    } else {
      segments[index].filterGroup = this.currentFilterGroup;
    }
    this.workspaceService.setSegments(segments);
    this.appService.closeModal();
  }

  closeModal() {
    this.appService.closeModal();
  }

  checkNewSegment(): boolean {
    return this.temporaryName !== '' && this.segments.filter(s => s.name.indexOf(this.temporaryName) > -1).length === 0;
  }

  setTemporaryName($event: any) {
    this.temporaryName = $event.target.value;
  }
}
