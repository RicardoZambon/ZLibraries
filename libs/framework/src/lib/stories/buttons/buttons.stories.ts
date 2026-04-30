import { RouteReuseStrategy } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { RibbonComponent, RibbonGroupComponent } from '@zambon/library';
import { of } from 'rxjs';
import { ButtonComponent } from '../../components/buttons/button/button.component';
import { ButtonConfirmComponent } from '../../components/buttons/button-confirm/button-confirm.component';
import { ButtonDeleteComponent } from '../../components/buttons/button-delete/button-delete.component';
import { ButtonEditComponent } from '../../components/buttons/button-edit/button-edit.component';
import { ButtonFiltersComponent } from '../../components/buttons/button-filters/button-filters.component';
import { ButtonNewComponent } from '../../components/buttons/button-new/button-new.component';
import { ButtonOpenRecordComponent } from '../../components/buttons/button-open-record/button-open-record.component';
import { ButtonRefreshComponent } from '../../components/buttons/button-refresh/button-refresh.component';
import { ButtonSaveComponent } from '../../components/buttons/button-save/button-save.component';
import { ButtonViewsComponent } from '../../components/buttons/button-views/button-views.component';
import { CustomReuseStrategy, TabService, TabViewService } from '../../services';

const meta: Meta<ButtonComponent> = {
  component: ButtonComponent,
  decorators: [
    moduleMetadata({
      imports: [
        ButtonComponent,
        ButtonConfirmComponent,
        ButtonDeleteComponent,
        ButtonEditComponent,
        ButtonFiltersComponent,
        ButtonNewComponent,
        ButtonOpenRecordComponent,
        ButtonRefreshComponent,
        ButtonSaveComponent,
        ButtonViewsComponent,
        RibbonComponent,
        RibbonGroupComponent,
        ReactiveFormsModule,
      ],
      providers: [
        TabService,
        TabViewService,
        { provide: RouteReuseStrategy, useClass: CustomReuseStrategy },
      ],
    }),
  ],
  title: 'Framework/Buttons',
};
export default meta;
type Story = StoryObj<ButtonComponent>;

export const RibbonActions: Story = {
  args: {
    color: 'text-primary-500',
    icon: 'fa-play',
    label: 'Run action',
  },
  render: (args) => ({
    props: {
      ...args,
      confirmAction: of(true),
      deleteAction: of(true),
      filtersForm: new FormGroup({
        search: new FormControl<string>(''),
        status: new FormControl<string>(''),
      }),
    },
    template: `
      <div class="p-4 max-w-6xl">
        <lib-ribbon>
          <lib-ribbon-group label="Record">
            <framework-button
              [color]="color"
              [icon]="icon"
              [label]="label">
            </framework-button>
            <framework-button-new></framework-button-new>
            <framework-button-open-record></framework-button-open-record>
            <framework-button-edit></framework-button-edit>
            <framework-button-save></framework-button-save>
            <framework-button-refresh></framework-button-refresh>
          </lib-ribbon-group>

          <lib-ribbon-group label="Workflow">
            <framework-button-confirm
              [action]="confirmAction"
              color="text-green-600"
              icon="fa-circle-check"
              label="Approve"
              modalConfirmButtonColor="green-500"
              modalConfirmButtonLabel="Approve"
              modalMessage="Confirm this workflow action?"
              modalMessageIconColor="text-green-600"
              modalTitle="Approve record">
            </framework-button-confirm>
            <framework-button-delete
              [action]="deleteAction"
              label="Delete">
            </framework-button-delete>
          </lib-ribbon-group>

          <div right>
            <lib-ribbon-group label="View">
              <form [formGroup]="filtersForm">
                <framework-button-filters modalTitle="Filters" modalSize="xl">
                  <div class="grid gap-3 p-2">
                    <input class="form-input" formControlName="search" placeholder="Search" />
                    <input class="form-input" formControlName="status" placeholder="Status" />
                  </div>
                </framework-button-filters>
              </form>
              <framework-button-views></framework-button-views>
            </lib-ribbon-group>
          </div>
        </lib-ribbon>
      </div>
    `,
  }),
};

export const LoadingAndDisabled: Story = {
  args: {
    color: 'text-primary-500',
    icon: 'fa-sync-alt',
    label: 'Processing',
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="p-4 max-w-xl">
        <lib-ribbon>
          <lib-ribbon-group label="States">
            <framework-button
              [color]="color"
              [icon]="icon"
              [label]="label"
              [loading]="true">
            </framework-button>
            <framework-button
              color="text-slate-500"
              icon="fa-lock"
              label="Disabled"
              [disabled]="true">
            </framework-button>
          </lib-ribbon-group>
        </lib-ribbon>
      </div>
    `,
  }),
};
