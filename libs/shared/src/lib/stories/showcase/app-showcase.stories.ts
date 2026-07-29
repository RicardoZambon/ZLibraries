import { Component, inject, Injectable, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ROUTES, RouteReuseStrategy, RouterModule, Routes } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { applicationConfig, moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import {
  APP_CONFIG,
  AppConfig,
  ButtonDeleteComponent,
  ButtonEditComponent,
  ButtonNewComponent,
  ButtonOpenRecordComponent,
  ButtonRefreshComponent,
  ButtonSaveComponent,
  CustomReuseStrategy,
  DefaultDetailsTabViewComponent,
  DefaultTabViewComponent,
  FRAMEWORK_VIEW_TYPE,
  FrameworkViewType,
  FormView,
  Tab,
  TabService,
  TabViewBase,
  TabViewList,
} from '@zambon-dev/framework';
import {
  DataGridComponent,
  DataGridDataset,
  DataProviderService,
  FormGroupComponent,
  FormInputGroupComponent,
  FormService,
  GroupAccordionComponent,
  GroupScrollSpyComponent,
  IGridColumn,
  IListParameters,
  IListResult,
  ISidebarProfile,
  RibbonGroupComponent,
  SidebarMenu,
  SidebarService,
} from '@zambon-dev/library';
import { BehaviorSubject, defer, delay, map, Observable, of } from 'rxjs';
import { ServicesHistoryViewComponent } from '../../features/services-history/services-history-view/services-history-view.component';
import { MainLayoutComponent } from '../../layouts/main-layout/main-layout.component';
import { INotification, IOperationsHistoryList, IServicesHistoryList } from '../../models';
import { AuthenticationService, NotificationsService, OperationsHistoryService, ServicesHistoryService } from '../../services';

// ---------------------------------------------------------------------------
// Mock backend — latency
// ---------------------------------------------------------------------------

// Without a delay every mock resolves inside one change-detection pass, so the grid's loading
// spinner, the Refresh button's spinner and the form's loading state are never actually seen.
const SHOWCASE_READ_LATENCY_MS = 400;

// Longer for writes so ButtonSave's spinner and its one-second success tick, and the delete
// confirmation modal's loading state, are comfortably visible.
const SHOWCASE_WRITE_LATENCY_MS = 800;

// Reads stay on plain `of(...)`: they snapshot at call time, which is harmless because nothing
// mutates the seed arrays between call and emit. Only writes need `defer` to stay on-subscribe.

// ---------------------------------------------------------------------------
// Mock backend — in-memory seed data
// ---------------------------------------------------------------------------

interface IUsersList {
  email: string;
  id: number;
  isActive: boolean;
  name: string;
  username: string;
}

const USERS: IUsersList[] = [
  { id: 1, name: 'Ada Lovelace', username: 'ada.lovelace', email: 'ada@example.com', isActive: true },
  { id: 2, name: 'Alan Turing', username: 'alan.turing', email: 'alan@example.com', isActive: true },
  { id: 3, name: 'Grace Hopper', username: 'grace.hopper', email: 'grace@example.com', isActive: true },
  { id: 4, name: 'Edsger Dijkstra', username: 'edsger.dijkstra', email: 'edsger@example.com', isActive: false },
  { id: 5, name: 'Barbara Liskov', username: 'barbara.liskov', email: 'barbara@example.com', isActive: true },
];

// Detail-only field: mustChangePassword isn't a list row column, so it lives beside the seed array.
const USERS_MUST_CHANGE_PASSWORD: Set<number> = new Set<number>();

interface IUsersDisplay extends IUsersList {
  mustChangePassword: boolean;
}

function findUser(id: number): IUsersDisplay | null {
  const user: IUsersList | undefined = USERS.find((row: IUsersList) => row.id === id);
  return user ? { ...user, mustChangePassword: USERS_MUST_CHANGE_PASSWORD.has(id) } : null;
}

// Writes the saved user back to the seed array, the way a real backend would persist it, so the
// list view reflects both edits and newly created records.
function saveUser(model: Omit<IUsersDisplay, 'id'>, entityID?: number): IUsersDisplay {
  const id: number = entityID ?? nextId(USERS);

  if (model.mustChangePassword) {
    USERS_MUST_CHANGE_PASSWORD.add(id);
  } else {
    USERS_MUST_CHANGE_PASSWORD.delete(id);
  }

  // Built field-by-field rather than spread: `model` is the form's raw value, so it carries no
  // id, and spreading would also drag mustChangePassword into the persisted list row.
  const saved: IUsersList = upsertById(USERS, {
    email: model.email ?? '',
    id,
    isActive: model.isActive,
    name: model.name,
    username: model.username,
  });

  return { ...saved, mustChangePassword: model.mustChangePassword };
}

interface ICustomersList {
  city: string;
  email: string;
  id: number;
  isActive: boolean;
  name: string;
}

const CUSTOMERS: ICustomersList[] = [
  { id: 1, name: 'Acme Industries', city: 'Toronto', email: 'contact@acme.com', isActive: true },
  { id: 2, name: 'Globex Corporation', city: 'Montreal', email: 'hello@globex.com', isActive: true },
  { id: 3, name: 'Initech Systems', city: 'Vancouver', email: 'info@initech.com', isActive: false },
  { id: 4, name: 'Umbrella Health', city: 'Calgary', email: 'care@umbrella.com', isActive: true },
  { id: 5, name: 'Stark Manufacturing', city: 'Ottawa', email: 'sales@stark.com', isActive: true },
];

// Detail-only field: phone isn't part of the list row, so it lives beside the seed array.
const CUSTOMERS_PHONES: Map<number, string> = new Map<number, string>([
  [1, '+1 416 555 0101'],
  [2, '+1 514 555 0102'],
  [3, '+1 604 555 0103'],
  [4, '+1 403 555 0104'],
  [5, '+1 613 555 0105'],
]);

interface ICustomersDisplay extends ICustomersList {
  phone: string;
}

function findCustomer(id: number): ICustomersDisplay | null {
  const customer: ICustomersList | undefined = CUSTOMERS.find((row: ICustomersList) => row.id === id);
  return customer ? { ...customer, phone: CUSTOMERS_PHONES.get(id) ?? '' } : null;
}

// Writes the saved customer back to the seed array, the way a real backend would persist it, so
// the list view reflects both edits and newly created records.
function saveCustomer(model: Omit<ICustomersDisplay, 'id'>, entityID?: number): ICustomersDisplay {
  const id: number = entityID ?? nextId(CUSTOMERS);

  CUSTOMERS_PHONES.set(id, model.phone ?? '');

  // Built field-by-field rather than spread: `model` is the form's raw value, so it carries no
  // id, and spreading would also drag phone into the persisted list row.
  const saved: ICustomersList = upsertById(CUSTOMERS, {
    city: model.city ?? '',
    email: model.email ?? '',
    id,
    isActive: model.isActive,
    name: model.name,
  });

  return { ...saved, phone: model.phone ?? '' };
}

interface IUnitsList {
  code: string;
  description: string;
  id: number;
  name: string;
}

const UNITS: IUnitsList[] = [
  { id: 1, code: 'HQ-01', name: 'Head Office', description: 'Main administrative building' },
  { id: 2, code: 'WH-02', name: 'West Warehouse', description: 'Storage and logistics' },
  { id: 3, code: 'PL-03', name: 'Assembly Plant', description: 'Primary production line' },
  { id: 4, code: 'LB-04', name: 'Research Lab', description: 'Product development' },
  { id: 5, code: 'BR-05', name: 'Downtown Branch', description: 'Client-facing office' },
];

// ---------------------------------------------------------------------------
// Sidebar — the navigable menu tree. Menu `url`s must match the route paths.
// ---------------------------------------------------------------------------

const MENU_DASHBOARD = 1;
const MENU_GENERAL = 2;
const MENU_SECURITY = 3;

@Injectable()
class ShowcaseSidebarService extends SidebarService {
  public getMenuFromUrl(url: string): Observable<SidebarMenu> {
    return of(new SidebarMenu({ id: MENU_DASHBOARD, label: 'Showcase-Menus-Dashboard', icon: 'fa-chart-line', url }));
  }

  public getUserProfile(): ISidebarProfile {
    return {
      name: 'Ada Lovelace',
      title: 'System Administrator',
    };
  }

  protected loadMenus(parentMenu: SidebarMenu | null): Observable<SidebarMenu[]> {
    if (parentMenu?.id === MENU_GENERAL) {
      return of([
        new SidebarMenu({ id: 21, label: 'Showcase-Menus-Customers', icon: 'fa-address-book', url: '/general/customers', parent: parentMenu }),
        new SidebarMenu({ id: 22, label: 'Showcase-Menus-Units', icon: 'fa-building', url: '/general/units', parent: parentMenu }),
      ]).pipe(delay(SHOWCASE_READ_LATENCY_MS));
    }

    if (parentMenu?.id === MENU_SECURITY) {
      return of([
        new SidebarMenu({ id: 31, label: 'Showcase-Menus-Users', icon: 'fa-user', url: '/security/users', parent: parentMenu }),
      ]).pipe(delay(SHOWCASE_READ_LATENCY_MS));
    }

    return of([
      new SidebarMenu({ id: MENU_DASHBOARD, label: 'Showcase-Menus-Dashboard', icon: 'fa-chart-line', url: '/dashboard', region: 'Showcase-Region-Main' }),
      new SidebarMenu({ id: MENU_GENERAL, label: 'Showcase-Menus-General', icon: 'fa-layer-group', childCount: 2, region: 'Showcase-Region-Main' }),
      new SidebarMenu({ id: MENU_SECURITY, label: 'Showcase-Menus-Security', icon: 'fa-shield-halved', childCount: 1, region: 'Showcase-Region-Administration' }),
    ]).pipe(delay(SHOWCASE_READ_LATENCY_MS));
  }
}

// ---------------------------------------------------------------------------
// Mock backend — grid datasets, data providers and shared write helpers
// ---------------------------------------------------------------------------

// Serves rows straight from an in-memory array. Rows are copied on every read so the grid's
// internal `_key` bookkeeping never leaks back into the seed arrays.
@Injectable()
abstract class ShowcaseDataset<TListModel> extends DataGridDataset {
  public getData(): Observable<IListResult<TListModel>> {
    const items: TListModel[] = this.rows();
    return of({
      items: items.map((row: TListModel) => ({ ...row })),
      totalRows: items.length,
    }).pipe(delay(SHOWCASE_READ_LATENCY_MS));
  }

  protected abstract rows(): TListModel[];
}

// Removes a row from an in-memory array. Deferred so the mutation runs when the delete button
// subscribes — NOT when the template evaluates `[action]="onDelete()"` on every change-detection
// pass, which would delete rows just by rendering.
function deleteById<TListModel extends { id: number }>(rows: TListModel[], id: number): Observable<unknown> {
  return defer(() => {
    const index: number = rows.findIndex((row: TListModel) => row.id === id);
    if (index >= 0) {
      rows.splice(index, 1);
    }
    return of(null);
  }).pipe(delay(SHOWCASE_WRITE_LATENCY_MS));
}

// Next free id for an in-memory seed array. Derived from the max rather than the length so it
// cannot collide with an existing row after a delete.
function nextId(rows: { id: number }[]): number {
  return rows.reduce((max: number, row: { id: number }) => Math.max(max, row.id), 0) + 1;
}

// Replaces the row with a matching id, or appends it — a real backend's update-or-insert — so the
// list views reflect saves. Assigns in place rather than splice+push so edits keep row order.
function upsertById<TListModel extends { id: number }>(rows: TListModel[], row: TListModel): TListModel {
  const index: number = rows.findIndex((existing: TListModel) => existing.id === row.id);
  if (index >= 0) {
    rows[index] = row;
  } else {
    rows.push(row);
  }
  return row;
}

@Injectable()
class UsersDataset extends ShowcaseDataset<IUsersList> {
  public override columns: IGridColumn[] = [
    { field: 'name', headerName: 'Showcase-Users-Column-Name' },
    { field: 'username', headerName: 'Showcase-Users-Column-Username' },
    { field: 'email', headerName: 'Showcase-Users-Column-Email' },
  ];

  protected rows(): IUsersList[] {
    return USERS;
  }
}

@Injectable()
class UsersDataProvider extends DataProviderService<IUsersDisplay> {
  public getTitle(entity: IUsersDisplay): string {
    return entity?.name ?? '';
  }

  public saveModel(model: Omit<IUsersDisplay, 'id'>): Observable<IUsersDisplay> {
    // `hasEntityID`, not `entityID ?? …`: on the /new route entityID is NaN (Number('new')), and
    // NaN is neither null nor undefined, so `??` would pass NaN straight through as the id.
    // `defer` keeps the write on-subscribe rather than evaluating eagerly at call time.
    return defer(() => of(saveUser(model, this.hasEntityID ? this.entityID : undefined)))
      .pipe(delay(SHOWCASE_WRITE_LATENCY_MS));
  }

  protected loadModel(entityID?: number): Observable<IUsersDisplay | null> {
    return of(entityID ? findUser(entityID) : null).pipe(delay(SHOWCASE_READ_LATENCY_MS));
  }
}

@Injectable()
class CustomersDataset extends ShowcaseDataset<ICustomersList> {
  public override columns: IGridColumn[] = [
    { field: 'name', headerName: 'Showcase-Customers-Column-Name' },
    { field: 'city', headerName: 'Showcase-Customers-Column-City' },
    { field: 'email', headerName: 'Showcase-Customers-Column-Email' },
    { field: 'isActive', headerName: 'Showcase-Customers-Column-IsActive', size: '6rem' },
  ];

  protected rows(): ICustomersList[] {
    return CUSTOMERS;
  }
}

@Injectable()
class CustomersDataProvider extends DataProviderService<ICustomersDisplay> {
  public getTitle(entity: ICustomersDisplay): string {
    return entity?.name ?? '';
  }

  public saveModel(model: Omit<ICustomersDisplay, 'id'>): Observable<ICustomersDisplay> {
    // `hasEntityID`, not `entityID ?? …`: on the /new route entityID is NaN (Number('new')), and
    // NaN is neither null nor undefined, so `??` would pass NaN straight through as the id.
    // `defer` keeps the write on-subscribe rather than evaluating eagerly at call time.
    return defer(() => of(saveCustomer(model, this.hasEntityID ? this.entityID : undefined)))
      .pipe(delay(SHOWCASE_WRITE_LATENCY_MS));
  }

  protected loadModel(entityID?: number): Observable<ICustomersDisplay | null> {
    return of(entityID ? findCustomer(entityID) : null).pipe(delay(SHOWCASE_READ_LATENCY_MS));
  }
}

@Injectable()
class UnitsDataset extends ShowcaseDataset<IUnitsList> {
  public override columns: IGridColumn[] = [
    { field: 'code', headerName: 'Showcase-Units-Column-Code', size: '8rem' },
    { field: 'name', headerName: 'Showcase-Units-Column-Name' },
    { field: 'description', headerName: 'Showcase-Units-Column-Description' },
  ];

  protected rows(): IUnitsList[] {
    return UNITS;
  }
}

// ---------------------------------------------------------------------------
// Mock backend — audit history
// ---------------------------------------------------------------------------

// Fixed timestamps, not new Date(), so the story renders identically on every load.
const SHOWCASE_AUDIT_DATES: Date[] = [
  new Date('2026-07-20T14:05:00Z'),
  new Date('2026-07-24T09:30:00Z'),
  new Date('2026-07-28T16:45:00Z'),
];

// Rows carry BOTH `ID` and `id`. The models declare `ID`, but GridDataset.compareProperty defaults
// to 'id', so getRowID() reads the lowercase key — without it, selecting a service row never
// propagates and the operations grid stays empty. Emitting both keeps the declared model satisfied
// and the grid working; the underlying @shared mismatch is filed separately.
interface IShowcaseServiceHistoryRow extends IServicesHistoryList {
  id: number;
}

interface IShowcaseOperationHistoryRow extends IOperationsHistoryList {
  id: number;
}

function showcaseServiceHistory(controllerName: string): IShowcaseServiceHistoryRow[] {
  const entity: string = controllerName === 'Customers' ? 'Customer' : 'User';
  return [
    { ID: 1, id: 1, name: `${entity} created`, changedByName: 'Ada Lovelace', changedOn: SHOWCASE_AUDIT_DATES[0] },
    { ID: 2, id: 2, name: `${entity} updated`, changedByName: 'Grace Hopper', changedOn: SHOWCASE_AUDIT_DATES[1] },
    { ID: 3, id: 3, name: `${entity} deactivated`, changedByName: 'Alan Turing', changedOn: SHOWCASE_AUDIT_DATES[2] },
  ];
}

@Injectable()
class ShowcaseServicesHistoryService {
  public list(controllerName: string, _entityID: number, _parameters: IListParameters): Observable<IServicesHistoryList[]> {
    return of(showcaseServiceHistory(controllerName)).pipe(delay(SHOWCASE_READ_LATENCY_MS));
  }
}

@Injectable()
class ShowcaseOperationsHistoryService {
  public list(_controllerName: string, _entityID: number, serviceHistoryID: number, _parameters: IListParameters): Observable<IOperationsHistoryList[]> {
    const rows: IShowcaseOperationHistoryRow[] = [
      {
        ID: 1, id: 1, entityName: 'Record', operationType: 'Modified',
        oldValues: JSON.stringify({ isActive: true, name: 'Globex Corporation' }, null, 2),
        newValues: JSON.stringify({ isActive: false, name: 'Globex Corporation Ltd' }, null, 2),
      },
      {
        ID: 2, id: 2, entityName: 'Contact', operationType: 'Added',
        oldValues: JSON.stringify({}, null, 2),
        newValues: JSON.stringify({ phone: '+1 514 555 0102' }, null, 2),
      },
    ];
    // Vary by selected service row so drilling into different entries shows different operations.
    return of(serviceHistoryID === 1 ? rows.slice(1) : rows).pipe(delay(SHOWCASE_READ_LATENCY_MS));
  }
}

// ---------------------------------------------------------------------------
// Dashboard screen — a plain component (no grid, no form)
// ---------------------------------------------------------------------------

interface IDashboardCard {
  icon: string;
  label: string;
  value: string;
}

@Component({
  selector: 'shared-showcase-dashboard',
  imports: [TranslatePipe],
  template: `
    <!-- Every screen publishes a ribbon template, even an empty one, so the ribbon bar is
         driven by the view rather than DefaultTabViewComponent's internal fallback. -->
    <ng-template #ribbon></ng-template>

    <div class="p-6 flex flex-col gap-6">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        @for (card of cards; track card.label) {
          <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div class="flex items-center gap-3">
              <i class="fa-solid {{ card.icon }} text-xl text-slate-400"></i>
              <div>
                <div class="text-2xl font-semibold text-slate-800">{{ card.value }}</div>
                <div class="text-xs uppercase tracking-wide text-slate-500">{{ card.label | translate }}</div>
              </div>
            </div>
          </div>
        }
      </div>

      <div class="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div class="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
          {{ 'Showcase-Dashboard-RecentActivity' | translate }}
        </div>
        <ul class="divide-y divide-slate-100">
          @for (entry of activity; track entry) {
            <li class="px-4 py-2 text-sm text-slate-600">{{ entry | translate }}</li>
          }
        </ul>
      </div>
    </div>
  `,
})
class DashboardComponent extends TabViewBase {
  protected activity: string[] = [
    'Showcase-Dashboard-Activity-1',
    'Showcase-Dashboard-Activity-2',
    'Showcase-Dashboard-Activity-3',
    'Showcase-Dashboard-Activity-4',
  ];

  protected cards: IDashboardCard[] = [
    { label: 'Showcase-Dashboard-Card-Users', value: `${USERS.length}`, icon: 'fa-user' },
    { label: 'Showcase-Dashboard-Card-Customers', value: `${CUSTOMERS.length}`, icon: 'fa-address-book' },
    { label: 'Showcase-Dashboard-Card-Units', value: `${UNITS.length}`, icon: 'fa-building' },
  ];
}

// ---------------------------------------------------------------------------
// Users — list and detail views
// ---------------------------------------------------------------------------

@Component({
  selector: 'shared-showcase-users-list',
  imports: [
    ButtonDeleteComponent,
    ButtonNewComponent,
    ButtonOpenRecordComponent,
    ButtonRefreshComponent,
    DataGridComponent,
    RibbonGroupComponent,
    TranslatePipe,
  ],
  providers: [{ provide: DataGridDataset, useClass: UsersDataset }],
  template: `
    <ng-template #ribbon>
      <lib-ribbon-group [label]="'RibbonGroup-Entity' | translate">
        <framework-button-new></framework-button-new>
        <framework-button-open-record></framework-button-open-record>
        <framework-button-delete [action]="onDelete()" [disabled]="!hasRowsSelected"></framework-button-delete>
      </lib-ribbon-group>
      <lib-ribbon-group [label]="'RibbonGroup-General' | translate">
        <framework-button-refresh></framework-button-refresh>
      </lib-ribbon-group>
    </ng-template>

    <lib-data-grid></lib-data-grid>
  `,
})
class UsersListComponent extends TabViewList<IUsersList> {
  protected onDelete(): Observable<unknown> {
    return deleteById(USERS, this.selectedItem?.id ?? -1);
  }
}

@Component({
  selector: 'shared-showcase-users-form',
  imports: [
    ButtonEditComponent,
    ButtonNewComponent,
    ButtonSaveComponent,
    FormGroupComponent,
    FormInputGroupComponent,
    GroupAccordionComponent,
    GroupScrollSpyComponent,
    ReactiveFormsModule,
    RibbonGroupComponent,
    TranslatePipe,
  ],
  providers: [{ provide: FormService }],
  template: `
    <ng-template #ribbon>
      <lib-ribbon-group [label]="'RibbonGroup-Entity' | translate">
        <framework-button-new></framework-button-new>
        <framework-button-edit></framework-button-edit>
        <framework-button-save></framework-button-save>
      </lib-ribbon-group>
    </ng-template>

    <lib-group-scroll-spy>
      <form ngNoForm [formGroup]="dataForm">
        <lib-group-accordion [label]="'Showcase-EditSection-Details' | translate">
          <lib-form-group label="Showcase-Users-FormGroup-User">
            <lib-form-input-group
              controlName="name"
              label="Showcase-Users-Field-Name"
              [maxLength]="200"
              [validations]="{ 'required': 'Showcase-Users-Validations-Name-Required' }">
            </lib-form-input-group>
            <lib-form-input-group
              controlName="username"
              label="Showcase-Users-Field-Username"
              [maxLength]="100"
              [validations]="{ 'required': 'Showcase-Users-Validations-Username-Required' }">
            </lib-form-input-group>
            <lib-form-input-group controlName="email" label="Showcase-Users-Field-Email" [maxLength]="200">
            </lib-form-input-group>
            <lib-form-input-group controlName="isActive" label="Showcase-Users-Field-IsActive" type="checkbox">
            </lib-form-input-group>
            <lib-form-input-group controlName="mustChangePassword" label="Showcase-Users-Field-MustChangePassword" type="checkbox">
            </lib-form-input-group>
          </lib-form-group>
        </lib-group-accordion>
      </form>
    </lib-group-scroll-spy>
  `,
})
class UsersFormComponent extends FormView<IUsersDisplay> {
  protected formSetup(): FormGroup {
    return this.formBuilder.group({
      email: [null],
      isActive: [true, { nonNullable: true }],
      mustChangePassword: [false, { nonNullable: true }],
      name: [null, Validators.required],
      username: [null, Validators.required],
    });
  }
}

// ---------------------------------------------------------------------------
// Customers — list and detail views
// ---------------------------------------------------------------------------

@Component({
  selector: 'shared-showcase-customers-list',
  imports: [
    ButtonDeleteComponent,
    ButtonNewComponent,
    ButtonOpenRecordComponent,
    ButtonRefreshComponent,
    DataGridComponent,
    RibbonGroupComponent,
    TranslatePipe,
  ],
  providers: [{ provide: DataGridDataset, useClass: CustomersDataset }],
  template: `
    <ng-template #ribbon>
      <lib-ribbon-group [label]="'RibbonGroup-Entity' | translate">
        <framework-button-new></framework-button-new>
        <framework-button-open-record></framework-button-open-record>
        <framework-button-delete [action]="onDelete()" [disabled]="!hasRowsSelected"></framework-button-delete>
      </lib-ribbon-group>
      <lib-ribbon-group [label]="'RibbonGroup-General' | translate">
        <framework-button-refresh></framework-button-refresh>
      </lib-ribbon-group>
    </ng-template>

    <lib-data-grid></lib-data-grid>
  `,
})
class CustomersListComponent extends TabViewList<ICustomersList> {
  protected onDelete(): Observable<unknown> {
    return deleteById(CUSTOMERS, this.selectedItem?.id ?? -1);
  }
}

@Component({
  selector: 'shared-showcase-customers-form',
  imports: [
    ButtonEditComponent,
    ButtonNewComponent,
    ButtonSaveComponent,
    FormGroupComponent,
    FormInputGroupComponent,
    GroupAccordionComponent,
    GroupScrollSpyComponent,
    ReactiveFormsModule,
    RibbonGroupComponent,
    TranslatePipe,
  ],
  providers: [{ provide: FormService }],
  template: `
    <ng-template #ribbon>
      <lib-ribbon-group [label]="'RibbonGroup-Entity' | translate">
        <framework-button-new></framework-button-new>
        <framework-button-edit></framework-button-edit>
        <framework-button-save></framework-button-save>
      </lib-ribbon-group>
    </ng-template>

    <lib-group-scroll-spy>
      <form ngNoForm [formGroup]="dataForm">
        <lib-group-accordion [label]="'Showcase-EditSection-Details' | translate">
          <lib-form-group label="Showcase-Customers-FormGroup-Customer">
            <lib-form-input-group
              controlName="name"
              label="Showcase-Customers-Field-Name"
              [maxLength]="200"
              [validations]="{ 'required': 'Showcase-Customers-Validations-Name-Required' }">
            </lib-form-input-group>
            <lib-form-input-group controlName="email" label="Showcase-Customers-Field-Email" [maxLength]="200">
            </lib-form-input-group>
            <lib-form-input-group controlName="phone" label="Showcase-Customers-Field-Phone" [maxLength]="40">
            </lib-form-input-group>
            <lib-form-input-group controlName="isActive" label="Showcase-Customers-Field-IsActive" type="checkbox">
            </lib-form-input-group>
          </lib-form-group>
        </lib-group-accordion>

        <lib-group-accordion [label]="'Showcase-EditSection-Address' | translate">
          <lib-form-group label="Showcase-Customers-FormGroup-Location">
            <lib-form-input-group controlName="city" label="Showcase-Customers-Field-City" [maxLength]="100">
            </lib-form-input-group>
          </lib-form-group>
        </lib-group-accordion>
      </form>
    </lib-group-scroll-spy>
  `,
})
class CustomersFormComponent extends FormView<ICustomersDisplay> {
  protected formSetup(): FormGroup {
    return this.formBuilder.group({
      city: [null],
      email: [null],
      isActive: [true, { nonNullable: true }],
      name: [null, Validators.required],
      phone: [null],
    });
  }
}

// ---------------------------------------------------------------------------
// Units — list view only. No detail route exists, so the ribbon deliberately
// omits New/Open/Delete rather than offering buttons that lead nowhere.
// ---------------------------------------------------------------------------

@Component({
  selector: 'shared-showcase-units-list',
  imports: [
    ButtonRefreshComponent,
    DataGridComponent,
    RibbonGroupComponent,
    TranslatePipe,
  ],
  providers: [{ provide: DataGridDataset, useClass: UnitsDataset }],
  template: `
    <ng-template #ribbon>
      <lib-ribbon-group [label]="'RibbonGroup-General' | translate">
        <framework-button-refresh></framework-button-refresh>
      </lib-ribbon-group>
    </ng-template>

    <lib-data-grid></lib-data-grid>
  `,
})
class UnitsListComponent extends TabViewList<IUnitsList> {}

// ---------------------------------------------------------------------------
// Story shell — brand, notifications and user identity
// ---------------------------------------------------------------------------

// Inline data URI, not a URL: the story must stay self-contained with no external requests.
const SHOWCASE_LOGO =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">' +
      '<rect width="32" height="32" rx="7" fill="#006bb6"/>' +
      '<path d="M9 22.5 17.5 9.5h5.5L14.5 22.5z" fill="#ffffff"/>' +
      '<circle cx="11" cy="11" r="2.5" fill="#ffffff"/>' +
    '</svg>'
  );

// Plain text, NOT translation keys: NotificationsComponent renders `{{ item.title }}` and
// `{{ item.description }}` raw — only its own chrome is piped. That is correct by design, since
// real notifications arrive from the backend already localized.
const SHOWCASE_NOTIFICATIONS: INotification[] = [
  {
    title: 'Customer updated',
    description: 'Acme Industries was updated by Ada Lovelace.',
    icon: 'fa-solid fa-circle-info',
    callToActionUrl: '/general/customers/1',
    isRead: false,
  },
  {
    title: 'Unit needs review',
    description: 'Assembly Plant has no active supervisor.',
    icon: 'fa-solid fa-triangle-exclamation',
    isRead: false,
  },
  {
    title: 'Export finished',
    description: 'The customers list export is ready to download.',
    icon: 'fa-solid fa-envelope',
    isRead: true,
  },
];

// Mocked so the bell renders without the real service opening a SignalR connection.
// getNotifications()/getUnreadCount() are read in NotificationsComponent field initializers,
// so they must exist and return immediately.
//
// Reactive like the real service, which re-emits from a BehaviorSubject — otherwise "Mark all as
// read" and clicking an unread item would be visibly inert.
const showcaseNotifications$ = new BehaviorSubject<INotification[]>(SHOWCASE_NOTIFICATIONS);

const notificationsServiceMock: Pick<NotificationsService,
  'getNotifications' | 'getUnreadCount' | 'isEnabled' | 'markAllAsRead' | 'markAsRead' | 'start' | 'stop'> = {
  isEnabled: true,
  getNotifications: () => showcaseNotifications$.asObservable(),
  getUnreadCount: () => showcaseNotifications$.pipe(
    map((items: INotification[]) => items.filter((item: INotification) => !item.isRead).length)),
  markAllAsRead: () => showcaseNotifications$.next(
    showcaseNotifications$.value.map((item: INotification) => ({ ...item, isRead: true }))),
  markAsRead: (notification: INotification) => showcaseNotifications$.next(
    showcaseNotifications$.value.map((item: INotification) =>
      (item === notification ? { ...item, isRead: true } : item))),
  start: () => undefined,
  stop: () => Promise.resolve(),
};

// The globally provided auth mock has no position/pictureUrl, so the user block renders bare.
// pictureUrl is deliberately omitted so the initials fallback renders — one fewer inline asset.
//
// Only AuthenticationService is overridden, deliberately: ribbon buttons inject the separate
// AuthService token (see base-button.ts) which the global Storybook providers already mock for
// permission checks. Aliasing the two would break every button with allowedActions.
const authenticationServiceMock: Pick<AuthenticationService, 'getUserInfo' | 'isAuthenticated' | 'signOut'> = {
  getUserInfo: () => ({
    costCenterName: 'IT',
    name: 'Ada Lovelace',
    position: 'System Administrator',
  }),
  isAuthenticated: true,
  signOut: () => undefined,
};

// ---------------------------------------------------------------------------
// Story shell — hosts the router outlet and seeds the first tab
// ---------------------------------------------------------------------------

// The story renders this, and the router puts MainLayoutComponent inside it. This mirrors the
// real app (app.routes.ts), where MainLayoutComponent is a routed component with the screens as
// children — so TabsComponent initializes only after the router has matched a route and can find
// the FRAMEWORK_VIEW_TYPE it needs to open the first tab.
@Component({
  selector: 'shared-showcase-root',
  imports: [RouterModule],
  template: `<router-outlet></router-outlet>`,
})
class ShowcaseRootComponent implements OnInit {
  private tabService: TabService = inject(TabService);

  public ngOnInit(): void {
    // Seed the initial tab WITH its title. TabsComponent opens the first tab itself but
    // supplies no title, and Tab.isTitleLoading defaults to true — so the tab would spin
    // forever. MainLayoutComponent's normal title resolution (getMenuFromUrl ->
    // updateTabTitle) cannot cover it here: it runs before TabsComponent creates the tab,
    // and it matches on router.url, which in Storybook carries the ?id=&viewMode= query
    // string and so never equals the tab's '/dashboard'. Seeding an exact-URL match means
    // TabsComponent focuses this tab rather than opening an untitled second one.
    this.tabService.closeAllTabs();
    this.tabService.openTab(new Tab({ isTitleLoading: false, title: 'Showcase-Menus-Dashboard', url: '/dashboard' }));
  }
}

// ---------------------------------------------------------------------------
// Routes — one path segment per route, nested. RouteHelper.getRouteURL() collects each
// route's segments walking up the parent chain and then reverses the flat list, so a
// multi-segment path like 'general/customers' would rebuild as '/customers/general' and
// break the URLs that ButtonNew/ButtonOpenRecord/ButtonSave construct.
// ---------------------------------------------------------------------------

const showcaseRoutes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        component: DefaultTabViewComponent,
        data: { [FRAMEWORK_VIEW_TYPE]: FrameworkViewType.List },
        children: [
          { path: '', component: DashboardComponent },
        ],
      },
      {
        path: 'general',
        children: [
          {
            path: 'customers',
            children: [
              {
                path: '',
                component: DefaultTabViewComponent,
                data: { [FRAMEWORK_VIEW_TYPE]: FrameworkViewType.List },
                children: [
                  { path: '', component: CustomersListComponent },
                ],
              },
              {
                path: ':id',
                component: DefaultDetailsTabViewComponent,
                data: {
                  [FRAMEWORK_VIEW_TYPE]: FrameworkViewType.Details,
                  dataProvider: () => new CustomersDataProvider(),
                  defaultTitle: 'Showcase-Customers-Details-Title-New',
                },
                children: [
                  { path: '', component: CustomersFormComponent, data: { icon: 'fa-address-book', title: 'Button-Views-Details' } },
                  { path: 'audit', component: ServicesHistoryViewComponent,
                    data: { controllerName: 'Customers', icon: 'fa-history', title: 'Button-Views-History' } },
                ],
              },
            ],
          },
          {
            path: 'units',
            children: [
              {
                path: '',
                component: DefaultTabViewComponent,
                data: { [FRAMEWORK_VIEW_TYPE]: FrameworkViewType.List },
                children: [
                  { path: '', component: UnitsListComponent },
                ],
              },
            ],
          },
        ],
      },
      {
        path: 'security',
        children: [
          {
            path: 'users',
            children: [
              {
                path: '',
                component: DefaultTabViewComponent,
                data: { [FRAMEWORK_VIEW_TYPE]: FrameworkViewType.List },
                children: [
                  { path: '', component: UsersListComponent },
                ],
              },
              {
                path: ':id',
                component: DefaultDetailsTabViewComponent,
                data: {
                  [FRAMEWORK_VIEW_TYPE]: FrameworkViewType.Details,
                  dataProvider: () => new UsersDataProvider(),
                  defaultTitle: 'Showcase-Users-Details-Title-New',
                },
                children: [
                  { path: '', component: UsersFormComponent, data: { icon: 'fa-user', title: 'Button-Views-Details' } },
                  { path: 'audit', component: ServicesHistoryViewComponent,
                    data: { controllerName: 'Users', icon: 'fa-history', title: 'Button-Views-History' } },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  // Storybook bootstraps the app at /iframe.html, which matches nothing above.
  // Keep this LAST — Angular matches routes in order.
  { path: '**', redirectTo: 'dashboard' },
];

// ---------------------------------------------------------------------------
// Story
// ---------------------------------------------------------------------------

// Story-only: constrain the layout to its container (the app uses full-viewport sizing,
// which forces a scrollbar inside the Storybook canvas).
const FIT_TO_CONTAINER = `
  <style>
    ::ng-deep shared-main-layout { display: block; height: 100%; max-height: 100%; }
    ::ng-deep shared-main-layout .main-container { max-height: 100% !important; }
  </style>
`;

const meta: Meta<MainLayoutComponent> = {
  component: MainLayoutComponent,
  decorators: [
    moduleMetadata({ imports: [ShowcaseRootComponent] }),
    applicationConfig({
      providers: [
        // Adds the showcase routes to the router configured globally in
        // tools/storybook/storybook.providers.ts (which registers an empty route table).
        { provide: ROUTES, multi: true, useValue: showcaseRoutes },
        TabService,
        { provide: RouteReuseStrategy, useClass: CustomReuseStrategy },
        { provide: SidebarService, useClass: ShowcaseSidebarService },
        {
          provide: APP_CONFIG,
          useValue: new AppConfig('', {
            // Plain text, NOT translation keys: BrandComponent renders `{{ appName }}` and
            // `{{ companyName }}` raw, with no translate pipe, so a key would be shown literally.
            appName: 'ZLibraries Showcase',
            companyName: 'Zambon Dev',
            environment: 'QA',
            logoUrl: SHOWCASE_LOGO,
            notificationsEnabled: true,
            // Non-empty so the real service's isEnabled getter would also pass; the mock below
            // is what actually answers, so no connection is attempted.
            notificationsUrl: 'https://showcase.invalid/notifications',
            // No 'v' prefix — MainLayoutComponent's template renders `v{{ appVersion }}`.
            version: '1.0.0',
          }),
        },
        { provide: AuthenticationService, useValue: authenticationServiceMock },
        { provide: NotificationsService, useValue: notificationsServiceMock },
        { provide: OperationsHistoryService, useClass: ShowcaseOperationsHistoryService },
        { provide: ServicesHistoryService, useClass: ShowcaseServicesHistoryService },
      ],
    }),
  ],
  title: 'Shared/App Showcase',
};
export default meta;

export const NavigableApp: StoryObj<MainLayoutComponent> = {
  render: () => ({
    template: `
      ${FIT_TO_CONTAINER}
      <div class="h-[40rem] bg-slate-100">
        <shared-showcase-root></shared-showcase-root>
      </div>
    `,
  }),
};
