import { NgTemplateOutlet } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RibbonComponent } from '@library';
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
export class DefaultTabViewComponent implements AfterViewInit, OnDestroy, OnInit {
  //#region ViewChilds, Inputs, Outputs
  @ViewChild('emptyRibbon') private emptyRibbonTemplate!: TemplateRef<any>;
  //#endregion

  //#region Variables
  protected destroy$: Subject<boolean> = new Subject<boolean>();
  protected ribbonTemplate!: TemplateRef<any>;

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

  public ngAfterViewInit(): void {
    if (!this.ribbonTemplate) {
      // If there are no template assigned to the ribbon, we use the empty template.
      this.updateRibbonTemplate();
    }
  }

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
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
  private updateRibbonTemplate(template: TemplateRef<any> | undefined = undefined): void {
    if (!template) {
      template = this.emptyRibbonTemplate;
    }

    this.ribbonTemplate = template!;
    this.changeDetectorRef.detectChanges();
  }
  //#endregion
}