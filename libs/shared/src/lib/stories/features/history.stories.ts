import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TabViewService } from '@zambon-dev/framework';
import { IListParameters, RibbonComponent } from '@zambon-dev/library';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { Observable, of } from 'rxjs';
import { OperationsHistoryModalComponent } from '../../features/operations-history/operations-history-modal/operations-history-modal.component';
import { ServicesHistoryViewComponent } from '../../features/services-history/services-history-view/services-history-view.component';
import { IOperationsHistoryList, IServicesHistoryList } from '../../models';
import { OperationsHistoryService, ServicesHistoryService } from '../../services';

class StorybookOperationsHistoryService {
  public list(
    _controllerName: string,
    _entityID: number,
    _serviceHistoryID: number,
    _parameters: IListParameters,
  ): Observable<IOperationsHistoryList[]> {
    return of([
      {
        entityName: 'Customer',
        id: 1,
        newValues: JSON.stringify({ status: 'Active', amount: 149.9 }),
        oldValues: JSON.stringify({ status: 'Pending', amount: 99.9 }),
        operationType: 'Modified',
      },
      {
        entityName: 'Payment method',
        id: 2,
        newValues: JSON.stringify({ type: 'Credit card' }),
        oldValues: JSON.stringify({}),
        operationType: 'Added',
      },
    ]);
  }
}

class StorybookServicesHistoryService {
  public list(
    _controllerName: string,
    _entityID: number,
    _parameters: IListParameters,
  ): Observable<IServicesHistoryList[]> {
    return of([
      { id: 1, name: 'Record updated', changedByName: 'Ada Lovelace', changedOn: new Date() },
      { id: 2, name: 'Payment recalculated', changedByName: 'Grace Hopper', changedOn: new Date() },
    ]);
  }
}

/**
 * Renders the view together with the ribbon it contributes.
 *
 * The view hands its ribbon template to TabViewService and the application's tab view is what
 * renders it, so a story showing the view alone shows no refresh and no filter button. This does
 * that part's job, and nothing else.
 */
@Component({
  selector: 'shared-story-history-host',
  template: `
    <div class="flex h-[32rem] flex-col gap-2 overflow-hidden bg-white p-4">
      <lib-ribbon>
        <ng-container *ngTemplateOutlet="tabViewService.onUpdateRibbonTemplate | async"></ng-container>
      </lib-ribbon>

      <shared-services-history-view
        class="flex grow flex-col overflow-hidden"
        controllerName="Customers"
        usersCatalogEndpoint="/api/Employees/Catalog"
        [entityID]="1"
      >
      </shared-services-history-view>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [AsyncPipe, NgTemplateOutlet, RibbonComponent, ServicesHistoryViewComponent],
})
class StoryHistoryHostComponent {
  protected tabViewService: TabViewService = inject(TabViewService);
}

const meta: Meta<ServicesHistoryViewComponent> = {
  component: ServicesHistoryViewComponent,
  decorators: [
    moduleMetadata({
      imports: [OperationsHistoryModalComponent, StoryHistoryHostComponent],
      providers: [
        TabViewService,
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

export const WithRibbonAndFilters: Story = {
  render: () => ({
    template: `<shared-story-history-host></shared-story-history-host>`,
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
