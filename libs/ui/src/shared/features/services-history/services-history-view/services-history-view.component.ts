import { Component, inject, model, ModelSignal, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ButtonRefreshComponent, TabViewBase } from '@zambon-dev/ui/framework';
import { DataGridDataset, DataProviderService, RibbonGroupComponent } from '@zambon-dev/ui/library';
import { TranslatePipe } from '@ngx-translate/core';
import { take } from 'rxjs';
import { ServicesHistoryDataset } from '../../../datasets';
import { OperationsHistoryChildListComponent } from '../../operations-history';
import { ServicesHistoryChildListComponent } from '../services-history-child-list/services-history-child-list.component';
import { ServicesHistoryFilterComponent } from '../services-history-filter/services-history-filter.component';

@Component({
  selector: 'shared-services-history-view',
  templateUrl: './services-history-view.component.html',
  styleUrls: ['./services-history-view.component.scss'],
  imports: [
    ButtonRefreshComponent,
    OperationsHistoryChildListComponent,
    RibbonGroupComponent,
    ServicesHistoryChildListComponent,
    ServicesHistoryFilterComponent,
    TranslatePipe,
  ],
  // The services grid is provided here rather than inside its child list so that the ribbon's
  // refresh and filter buttons, which resolve DataGridDataset from their own injector, reach the
  // same instance the grid reads. The operations child list still provides its own, which shadows
  // this one within its subtree, so it is unaffected.
  providers: [{ provide: DataGridDataset, useClass: ServicesHistoryDataset }],
})
export class ServicesHistoryViewComponent extends TabViewBase {
  //#region ViewChilds, Inputs, Outputs
  // Models rather than inputs: the constructor fills the first two from route data when a host
  // has not bound them, and the entity id arrives from the data provider's stream.
  public readonly controllerName: ModelSignal<string> = model('');

  public readonly entityID: ModelSignal<number | undefined> = model<number>();

  /**
   * Catalog resolving the people who can appear as the author of a change, for the filter.
   *
   * Supplied through the route's `usersCatalogEndpoint` data, or bound directly. Without it the
   * author filter is not offered -- see {@link ServicesHistoryFilterComponent}.
   */
  public readonly usersCatalogEndpoint: ModelSignal<string | undefined> = model<string>();
  //#endregion

  //#region Variables
  /**
   * The filters applied to the services grid, forwarded to the operations grid.
   *
   * Only `onlyCurrentEntity` means anything to the operations list, and the backend reads only what
   * it recognises, so the set is passed whole rather than picked apart here: a filter added later
   * then reaches both lists without this having to learn about it.
   */
  protected readonly operationsFilters: WritableSignal<{ [key: string]: string } | undefined> = signal(undefined);

  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private dataProviderService: DataProviderService<any> | null = inject(DataProviderService, { optional: true });
  //#endregion

  //#region Properties
  //#endregion

  //#region Constructor and Angular life cycle methods
  constructor() {
    super();

    if (this.activatedRoute.snapshot.data['controllerName']) {
      this.controllerName.set(this.activatedRoute.snapshot.data['controllerName']);
    }

    if (this.activatedRoute.snapshot.data['usersCatalogEndpoint']) {
      this.usersCatalogEndpoint.set(this.activatedRoute.snapshot.data['usersCatalogEndpoint']);
    }

    if (this.dataProviderService) {
      this.dataProviderService
        .getModel$()
        .pipe(take(1))
        .subscribe((model: any) => {
          this.entityID.set(model.id);
        });
    }
  }
  //#endregion

  //#region Event handlers
  protected onFiltersChanged(filters?: { [key: string]: string }): void {
    this.operationsFilters.set(filters);
  }
  //#endregion

  //#region Public methods
  //#endregion

  //#region Private methods
  //#endregion
}
