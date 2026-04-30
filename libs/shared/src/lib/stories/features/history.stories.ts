import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { IListParameters } from '@zambon/library';
import { Observable, of } from 'rxjs';
import { OperationsHistoryModalComponent } from '../../features/operations-history/operations-history-modal/operations-history-modal.component';
import { ServicesHistoryViewComponent } from '../../features/services-history/services-history-view/services-history-view.component';
import { IOperationsHistoryList, IServicesHistoryList } from '../../models';
import { OperationsHistoryService, ServicesHistoryService } from '../../services';

class StorybookOperationsHistoryService {
  public list(_controllerName: string, _entityID: number, _serviceHistoryID: number, _parameters: IListParameters): Observable<IOperationsHistoryList[]> {
    return of([
      {
        entityName: 'Customer',
        ID: 1,
        newValues: JSON.stringify({ status: 'Active', amount: 149.9 }),
        oldValues: JSON.stringify({ status: 'Pending', amount: 99.9 }),
        operationType: 'Modified',
      } as IOperationsHistoryList,
      {
        entityName: 'Payment method',
        ID: 2,
        newValues: JSON.stringify({ type: 'Credit card' }),
        oldValues: JSON.stringify({}),
        operationType: 'Added',
      } as IOperationsHistoryList,
    ]);
  }
}

class StorybookServicesHistoryService {
  public list(_controllerName: string, _entityID: number, _parameters: IListParameters): Observable<IServicesHistoryList[]> {
    return of([
      { ID: 1, name: 'Record updated', changedByName: 'Ada Lovelace', changedOn: new Date() } as IServicesHistoryList,
      { ID: 2, name: 'Payment recalculated', changedByName: 'Grace Hopper', changedOn: new Date() } as IServicesHistoryList,
    ]);
  }
}

const meta: Meta<ServicesHistoryViewComponent> = {
  component: ServicesHistoryViewComponent,
  decorators: [
    moduleMetadata({
      imports: [OperationsHistoryModalComponent],
      providers: [
        { provide: OperationsHistoryService, useClass: StorybookOperationsHistoryService },
        { provide: ServicesHistoryService, useClass: StorybookServicesHistoryService },
      ],
    }),
  ],
  title: 'Shared/History',
};
export default meta;
type Story = StoryObj<ServicesHistoryViewComponent>;

export const ServicesAndOperations: Story = {
  args: {
    controllerName: 'Customers',
    entityID: 1,
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="p-4 h-[32rem] bg-white">
        <shared-services-history-view
          [controllerName]="controllerName"
          [entityID]="entityID">
        </shared-services-history-view>
      </div>
    `,
  }),
};

export const OperationDetailsModal: StoryObj<OperationsHistoryModalComponent> = {
  render: () => ({
    props: {
      oldValues: JSON.stringify({ status: 'Pending', amount: 99.9 }, null, 2),
      newValues: JSON.stringify({ status: 'Active', amount: 149.9 }, null, 2),
    },
    template: `
      <div class="p-4">
        <button type="button" class="btn blue-500" (click)="modal.toggleModal()">
          Open operation details
        </button>

        <shared-operations-history-modal
          #modal
          [oldValues]="oldValues"
          [newValues]="newValues">
        </shared-operations-history-modal>
      </div>
    `,
  }),
};
