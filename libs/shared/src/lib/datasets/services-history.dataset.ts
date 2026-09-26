import { inject, Injectable } from '@angular/core';
import { DataGridDataset, IGridColumn, IListParameters } from '@zambon-dev/library';
import { Observable, of } from 'rxjs';
import { IServicesHistoryList } from '../models';
import { ServicesHistoryService } from '../services';

@Injectable()
export class ServicesHistoryDataset extends DataGridDataset {
  //#region ViewChilds, Inputs, Outputs
  //#endregion

  //#region Variables
  public override columns: IGridColumn[] = [{ field: '', headerName: '' }];

  public controllerName?: string;

  protected servicesHistoryService: ServicesHistoryService = inject(ServicesHistoryService);
  //#endregion

  //#region Properties
  //#endregion

  //#region Constructor and Angular life cycle methods
  constructor() {
    super();

    this.configs.hideColumnHeaders = true;
    this.configs.rowHeight = 52;
  }
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  public getData(params: IListParameters): Observable<IServicesHistoryList[]> {
    return !!this.parentEntityId && !!this.controllerName
      ? this.servicesHistoryService.list(this.controllerName, this.parentEntityId, this.withUtcPeriod(params))
      : of<IServicesHistoryList[]>([]);
  }
  //#endregion

  //#region Private methods
  /**
   * Widens the picked dates to whole local days and sends them as UTC instants.
   *
   * A date input yields `YYYY-MM-DD` -- no time, no zone -- while the history stores UTC instants
   * and the backend compares what it is given. Sent as they are, "from the 5th to the 5th" is the
   * single instant at midnight and matches nothing, and in a zone behind UTC it does not even
   * cover the right day.
   *
   * Done here rather than in the filter form because the form is what the modal shows: reopening
   * it patches these values straight back into the fields, which have to keep reading as the dates
   * the person picked. This is the boundary where the request is built, so it is also the last
   * point that sees every caller.
   */
  private withUtcPeriod(params: IListParameters): IListParameters {
    const filters: { [key: string]: string } | undefined = params.filters;

    if (!filters?.['changedOnFrom'] && !filters?.['changedOnTo']) {
      return params;
    }

    const converted: { [key: string]: string } = { ...filters };

    if (filters['changedOnFrom']) {
      converted['changedOnFrom'] = ServicesHistoryDataset.toUtcInstant(filters['changedOnFrom'], 'start');
    }

    if (filters['changedOnTo']) {
      converted['changedOnTo'] = ServicesHistoryDataset.toUtcInstant(filters['changedOnTo'], 'end');
    }

    return { ...params, filters: converted };
  }

  private static toUtcInstant(value: string, edge: 'start' | 'end'): string {
    const [year, month, day]: number[] = value.split('-').map(Number);

    // Left alone when it is not the date input's own format: a value set from somewhere else is
    // already whatever its caller meant.
    if ([year, month, day].some((part: number) => Number.isNaN(part))) {
      return value;
    }

    return edge === 'start'
      ? new Date(year, month - 1, day, 0, 0, 0, 0).toISOString()
      : new Date(year, month - 1, day, 23, 59, 59, 999).toISOString();
  }
  //#endregion
}
