import { IListParameters } from '@zambon-dev/library';
import { Observable, of } from 'rxjs';
import { ServicesHistoryDataset } from './services-history.dataset';
import { IServicesHistoryList } from '../models';

/**
 * The dates the audit filter sends.
 *
 * A date input yields `YYYY-MM-DD`, the history stores UTC instants, and the backend compares what
 * it is given -- so the dataset is the last place that can turn one into the other. Built with
 * Object.create so the assertions are about that conversion and not about Angular's injector.
 */
describe(`${ServicesHistoryDataset.name} period`, () => {
  /** Captures the parameters the service is asked for, which is what the backend would receive. */
  function datasetSending(filters?: { [key: string]: string }): {
    dataset: ServicesHistoryDataset;
    sent: () => IListParameters | undefined;
  } {
    let sent: IListParameters | undefined;

    const dataset: ServicesHistoryDataset = Object.create(ServicesHistoryDataset.prototype);

    Object.defineProperty(dataset, 'parentEntityId', { value: 7, configurable: true });
    (<any>dataset).controllerName = 'Employees';
    (<any>dataset).servicesHistoryService = {
      list: (
        _controller: string,
        _entityID: number,
        parameters: IListParameters,
      ): Observable<IServicesHistoryList[]> => {
        sent = parameters;
        return of<IServicesHistoryList[]>([]);
      },
    };

    dataset.getData(<IListParameters>{ startRow: 0, endRow: 20, filters });

    return { dataset, sent: () => sent };
  }

  it('widens the two dates to the whole local day at each end', () => {
    const { sent } = datasetSending({ changedOnFrom: '2026-03-05', changedOnTo: '2026-03-05' });

    // The bounds are what the local day spans, expressed as instants: an exclusive pair of
    // midnights would be a single point and would match nothing on the day that was picked.
    expect(sent()?.filters?.['changedOnFrom']).toBe(new Date(2026, 2, 5, 0, 0, 0, 0).toISOString());
    expect(sent()?.filters?.['changedOnTo']).toBe(new Date(2026, 2, 5, 23, 59, 59, 999).toISOString());
  });

  it('converts one end without inventing the other', () => {
    const { sent } = datasetSending({ changedOnFrom: '2026-03-05' });

    expect(sent()?.filters?.['changedOnFrom']).toBe(new Date(2026, 2, 5, 0, 0, 0, 0).toISOString());
    expect(sent()?.filters?.['changedOnTo']).toBeUndefined();
  });

  it('leaves the other filters exactly as they were', () => {
    const { sent } = datasetSending({ name: 'IEmployeesService', changedOnTo: '2026-03-05' });

    expect(sent()?.filters?.['name']).toBe('IEmployeesService');
  });

  it('passes the parameters through untouched when no period was picked', () => {
    const filters: { [key: string]: string } = { name: 'IEmployeesService' };
    const { sent } = datasetSending(filters);

    expect(sent()?.filters).toBe(filters);
  });

  it('leaves a value that is not a date alone', () => {
    // Anything set from outside the filter form already means whatever its caller meant by it.
    const { sent } = datasetSending({ changedOnFrom: '2026-03-05T12:30:00.000Z' });

    expect(sent()?.filters?.['changedOnFrom']).toBe('2026-03-05T12:30:00.000Z');
  });
});
