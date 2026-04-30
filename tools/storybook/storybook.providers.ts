import { provideHttpClient } from '@angular/common/http';
import { APP_INITIALIZER, EnvironmentProviders, Provider } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { APP_CONFIG, AppConfig, AuthService } from '@zambon/framework';
import {
  DataGridConfigsProvider,
  DataGridDataset,
  DataProviderService,
  FormService,
  GridConfigsProvider,
  MultiSelectResultDataset,
} from '@zambon/library';
import { AuthenticationService } from '@zambon/shared';
import { provideTranslateService, TranslateFakeLoader, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';

class StorybookDataGridDataset extends DataGridDataset {
  public override columns = [
    { field: 'id', headerName: 'ID', size: '5rem' },
    { field: 'name', headerName: 'Name', size: 'minmax(12rem, 1fr)' },
    { field: 'status', headerName: 'Status', size: '10rem' },
  ];

  public getData(): Observable<any[]> {
    return of([
      { id: 1, name: 'Alpha record', status: 'Active' },
      { id: 2, name: 'Beta record', status: 'Pending' },
      { id: 3, name: 'Gamma record', status: 'Archived' },
    ]);
  }
}

class StorybookMultiSelectResultDataset extends MultiSelectResultDataset {
  public getData(): Observable<any[]> {
    return of([
      { id: 1, name: 'Selected alpha', status: 'Active' },
      { id: 2, name: 'Selected beta', status: 'Pending' },
    ]);
  }

  protected saveData(changedIds: any): Observable<any> {
    return of(changedIds);
  }
}

const dataProviderMock = {
  entityID: 1,
  hasEntityID: true,
  getError$: () => of(),
  getModel$: () => of({ id: 1, name: 'Storybook record' }),
  getTitle: (model: any) => model?.name ?? 'Storybook record',
  resetForNewEntity: () => undefined,
  saveModel: (model: any) => of(model),
  updateModel: () => undefined,
};

const authServiceMock = {
  adminAction: 'AdministrativeMaster',
  authenticate: () => of(undefined),
  checkActionIsAllowed: () => of(true),
  checkActionsAreAllowed: (actions: string[]) => of(actions.map(() => true)),
  getActions: () => of(['AdministrativeMaster']),
  getUserInfo: () => ({ id: 1, name: 'Storybook User', username: 'storybook' }),
  isAuthenticated: true,
  isTokenExpired: false,
  signOut: () => undefined,
  token: 'storybook-token',
  tryRefreshToken: () => of('storybook-token'),
  userID: 1,
};

function initializeTranslate(translateService: TranslateService): () => void {
  return () => {
    translateService.setDefaultLang('en');
    translateService.use('en');
  };
}

export const storybookApplicationProviders: Array<Provider | EnvironmentProviders> = [
  provideAnimations(),
  provideHttpClient(),
  provideRouter([]),
  provideTranslateService({
    defaultLanguage: 'en',
    loader: {
      provide: TranslateLoader,
      useClass: TranslateFakeLoader,
    },
  }),
  {
    provide: APP_INITIALIZER,
    multi: true,
    useFactory: initializeTranslate,
    deps: [TranslateService],
  },
  { provide: APP_CONFIG, useValue: new AppConfig('') },
  JwtHelperService,
  DataGridConfigsProvider,
  { provide: GridConfigsProvider, useExisting: DataGridConfigsProvider },
  FormService,
  { provide: DataGridDataset, useClass: StorybookDataGridDataset },
  { provide: MultiSelectResultDataset, useClass: StorybookMultiSelectResultDataset },
  { provide: DataProviderService, useValue: dataProviderMock },
  { provide: AuthService, useValue: authServiceMock },
  { provide: AuthenticationService, useValue: authServiceMock },
];
