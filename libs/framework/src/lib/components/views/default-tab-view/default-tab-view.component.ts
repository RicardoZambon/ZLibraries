import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RibbonComponent } from '@zambon-dev/library';
import { Subject, takeUntil } from 'rxjs';
import { TabViewService } from '../../../services';

@Component({
  selector: 'framework-default-tab-view',
  templateUrl: './default-tab-view.component.html',
  styleUrls: ['./default-tab-view.component.scss'],
  imports: [
    NgTemplateOutlet,
    RibbonComponent,
    RouterModule,
  ],
  providers: [{ provide: TabViewService }]
})
export class DefaultTabViewComponent implements OnDestroy, OnInit {
  //#region ViewChilds, Inputs, Outputs
  //#endregion

  //#region Variables
  protected destroy$: Subject<boolean> = new Subject<boolean>();
  protected ribbonTemplate?: TemplateRef<any>;

  private ribbonViewTemplate: { [viewId: string]: TemplateRef<any> | undefined } = {};
  //#endregion
  
  //#region Properties
  //#endregion

  //#region Constructor and Angular life cycle methods
  constructor(
    protected changeDetectorRef: ChangeDetectorRef,
    protected tabViewService: TabViewService,
  ) {
    
  }

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  public ngOnInit(): void {
    this.tabViewService.onUpdateRibbonTemplate
      .pipe(takeUntil(this.destroy$))
      .subscribe((template: TemplateRef<any> | undefined) => {
        this.ribbonViewTemplate[this.tabViewService.activeView] = template;
        this.updateRibbonTemplate(template);
      });

    this.tabViewService.onViewChanged
      .pipe(takeUntil(this.destroy$))
      .subscribe((viewId: string) => {
        this.updateRibbonTemplate(this.ribbonViewTemplate[viewId]); 
      });
  }
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  //#endregion

  //#region Private methods
  private updateRibbonTemplate(template: TemplateRef<any> | undefined): void {
    this.ribbonTemplate = template;

    if (template) {
      // Real template from a child view — render immediately so buttons appear
      // without waiting for the next change detection cycle (user interaction).
      this.changeDetectorRef.detectChanges();
    } else {
      // No template for this view — defer clearing the ribbon to avoid tearing down
      // an already rendered one for a frame while switching views (the incoming view
      // pushes its real template moments later in the same initialization cycle).
      //
      // Never assign the ribbon template from a lifecycle hook that runs after the first
      // change detection pass (e.g. ngAfterViewInit): the outlet below has already been
      // checked by then, so mutating it there trips NG0100 in dev mode.
      this.changeDetectorRef.markForCheck();
    }
  }
  //#endregion
}
