import { NgTemplateOutlet } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal, TemplateRef, WritableSignal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RibbonComponent } from '@zambon-dev/ui/library';
import { Subject, takeUntil } from 'rxjs';
import { TabViewService } from '../../../services';

@Component({
  selector: 'framework-default-tab-view',
  templateUrl: './default-tab-view.component.html',
  styleUrls: ['./default-tab-view.component.scss'],
  imports: [NgTemplateOutlet, RibbonComponent, RouterModule],
  providers: [{ provide: TabViewService }],
})
export class DefaultTabViewComponent implements OnDestroy, OnInit {
  //#region ViewChilds, Inputs, Outputs
  //#endregion

  //#region Variables
  protected destroy$: Subject<boolean> = new Subject<boolean>();
  protected readonly ribbonTemplate: WritableSignal<TemplateRef<any> | undefined> = signal(undefined);

  private hasNamedAView = false;
  private ribbonViewTemplate: { [viewId: string]: TemplateRef<any> | undefined } = {};
  //#endregion

  //#region Properties
  //#endregion

  //#region Constructor and Angular life cycle methods
  protected tabViewService: TabViewService = inject(TabViewService);

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

    this.tabViewService.onViewChanged.pipe(takeUntil(this.destroy$)).subscribe((viewId: string) => {
      this.claimUnnamedRibbon(viewId);

      this.updateRibbonTemplate(this.ribbonViewTemplate[viewId]);
    });
  }
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  //#endregion

  //#region Private methods
  /**
   * Claims the ribbon published before the active view had a name.
   *
   * A child view publishes its ribbon from ngAfterViewInit, and the view is only named afterwards,
   * so the first template of a tab is always cached under an empty id. For a tab opened straight
   * at a non-default view that id is never looked up again, the ribbon is emptied, and nothing
   * refills it -- a tab being re-activated has its child re-attached rather than re-created, so
   * ngAfterViewInit does not run a second time.
   *
   * Only the very first naming may claim it. The empty id is not a spare bucket: it is the default
   * view's own id, because that view is the one whose URL carries no sub-path. Once the user
   * starts switching views the unnamed template belongs to the view being *left*, and handing it
   * to the view being entered showed the previous view's buttons on the new one and left the
   * previous one with no buttons at all.
   *
   * @param viewId The view that has just become active.
   */
  private claimUnnamedRibbon(viewId: string): void {
    const isFirstNaming = !this.hasNamedAView;
    this.hasNamedAView = true;

    if (
      !isFirstNaming ||
      !viewId ||
      this.ribbonViewTemplate[viewId] !== undefined ||
      this.ribbonViewTemplate[''] === undefined
    ) {
      return;
    }

    this.ribbonViewTemplate[viewId] = this.ribbonViewTemplate[''];
    delete this.ribbonViewTemplate[''];
  }

  /**
   * One signal write, where there used to be a detectChanges()/markForCheck() pair.
   *
   * Those existed to render a real template at once while deferring a clear, so switching views
   * did not tear an already rendered ribbon down for a frame before the incoming view pushed its
   * own. A signal gets both for free: writes coalesce into the next pass, so a clear followed by
   * a set moments later is one render, not two. The NG0100 hazard goes with it -- a signal write
   * after the outlet has been checked schedules another pass instead of throwing.
   */
  private updateRibbonTemplate(template: TemplateRef<any> | undefined): void {
    this.ribbonTemplate.set(template);
  }
  //#endregion
}
