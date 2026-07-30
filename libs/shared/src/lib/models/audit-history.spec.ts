import { TestBed } from '@angular/core/testing';
import { DataGridConfigsProvider, GridConfigsProvider } from '@zambon-dev/library';
import { Observable, of } from 'rxjs';
import { OperationsHistoryDataset, ServicesHistoryDataset } from '../datasets';
import { OperationsHistoryService, ServicesHistoryService } from '../services';
import { IOperationsHistoryList, IServicesHistoryList } from './index';

// The literals below are the audit endpoints' wire contract, not arbitrary fixtures: they mirror
// ZWebAPI's ServicesHistoryListModel / OperationsHistoryListModel serialized under ASP.NET Core's
// default camelCase policy, which lowercases a leading uppercase run only — C# `ID` goes out as
// `id`, while `EntityID` keeps its trailing capitals and goes out as `entityID`.
//
// They must stay assignable to the models with no cast and no excess-property error. That is the
// part of this spec that actually guards the bug: the row identity the grid reads (`compareProperty`,
// 'id') has to be a key the models declare, or a service row's selection cannot reach the
// operations grid.
const SERVICE_HISTORY_PAYLOAD: IServicesHistoryList[] = [
  { changedByName: 'Ada Lovelace', changedOn: new Date('2026-07-20T14:05:00Z'), id: 1, name: 'Customer created' },
  { changedByName: 'Grace Hopper', changedOn: new Date('2026-07-24T09:30:00Z'), id: 2, name: 'Customer updated' },
];

const OPERATION_HISTORY_PAYLOAD: IOperationsHistoryList[] = [
  {
    entityID: 55,
    entityName: 'Customer',
    id: 7,
    newValues: '{"isActive":false}',
    oldValues: '{"isActive":true}',
    operationType: 'Modified',
    tableName: 'Customers',
  },
];

// The datasets mutate the rows they load (they stamp an internal key onto each one), so hand out a
// fresh copy per call rather than letting one test's load bleed into the next.
function copyOf<TRow>(rows: TRow[]): Observable<TRow[]> {
  return of(rows.map((row: TRow) => ({ ...row })));
}

describe('Audit history models', () => {
  describe('ServicesHistoryDataset', () => {
    let dataset: ServicesHistoryDataset;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          ServicesHistoryDataset,
          { provide: GridConfigsProvider, useClass: DataGridConfigsProvider },
          { provide: ServicesHistoryService, useValue: { list: () => copyOf(SERVICE_HISTORY_PAYLOAD) } },
        ],
      });

      dataset = TestBed.inject(ServicesHistoryDataset);
      dataset.controllerName = 'Customers';
      dataset.parentEntityId = 1;
      dataset.loadRows();
    });

    it('should resolve the row ID from the key the backend actually sends', () => {
      const keys: string[] = dataset.loadedKeys ?? [];
      const ids: number[] = keys.map((key: string) => dataset.getRowID(key));

      expect(ids).toEqual([1, 2]);
    });

    it('should recognise a loaded row by an ID taken from the payload', () => {
      expect(dataset.hasRowWithID(2)).toBe(true);
      expect(dataset.hasRowWithID(99)).toBe(false);
    });
  });

  describe('OperationsHistoryDataset', () => {
    let dataset: OperationsHistoryDataset;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          OperationsHistoryDataset,
          { provide: GridConfigsProvider, useClass: DataGridConfigsProvider },
          { provide: OperationsHistoryService, useValue: { list: () => copyOf(OPERATION_HISTORY_PAYLOAD) } },
        ],
      });

      dataset = TestBed.inject(OperationsHistoryDataset);
      dataset.controllerName = 'Customers';
      dataset.parentEntityId = 1;
      // Setting the service ID is what triggers the load, mirroring a service row being selected.
      dataset.serviceId = 2;
    });

    it('should resolve the row ID from the key the backend actually sends', () => {
      const keys: string[] = dataset.loadedKeys ?? [];
      const ids: number[] = keys.map((key: string) => dataset.getRowID(key));

      expect(ids).toEqual([7]);
    });
  });
});
