import { provideHttpClient } from '@angular/common/http';
import { APP_INITIALIZER, EnvironmentProviders, Provider } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { APP_CONFIG, AppConfig, AuthService } from '@zambon-dev/framework';
import {
  DataGridConfigsProvider,
  DataGridDataset,
  DataProviderService,
  FormService,
  GridConfigsProvider,
  MultiSelectResultDataset,
} from '@zambon-dev/library';
import { AuthenticationService } from '@zambon-dev/shared';
import { provideTranslateService, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';

// Real translations for the keys used across the stories, so the `translate` pipe resolves
// keys to text instead of echoing the key. Keys not listed here fall back to the key itself.
const storybookTranslations: Record<string, Record<string, string>> = {
  en: {
    'TopBar-Sidebar-Toggle': 'Toggle menu',
    'TopBar-Notifications-Title': 'Notifications',
    'TopBar-Notifications-Empty': 'No notifications',
    'TopBar-Notifications-MarkAllRead': 'Mark all as read',
    'Main-Logout': 'Logout',
    'Main-Logout-Modal-Message': 'Are you sure you want to log out?',
    'Main-Logout-Modal-Message-Cancel': 'Cancel',
    'Main-Logout-Modal-Message-Confirm': 'Logout',
    'LanguageSelector-Title': 'Select language',
    'Language-en': 'English',
    'Language-pt': 'Portuguese',
    // Framework button and modal labels — shared by every library's Storybook.
    'Button-Cancel-Edit': 'Cancel',
    'Button-Delete': 'Delete',
    'Button-Edit': 'Edit',
    'Button-Modal-Cancel': 'Cancel',
    'Button-Modal-Close': 'Close',
    'Button-New': 'New',
    'Button-Open-Record': 'Open',
    'Button-Refresh': 'Refresh',
    'Button-Save': 'Save',
    'Button-Save-And-Close': 'Save & Close',
    'Button-Save-And-New': 'Save & New',
    'Button-Views': 'Views',
    'Modal-Delete-Confirm': 'Confirm delete',
    'Modal-Delete-Message': 'You are about to delete records, is not possible to reverse this action. Are you sure you want to continue?',
    'Modal-Delete-Title': 'Confirm the record deletion',
    'Modal-Failed-Administrator': 'If the problem persists, please contact your administrator.',
    'Modal-Failed-DefaultMessage': 'An error occurred in the server. Please try again later.',
    'Modal-Failed-Title': 'An error occurred',
    'Modal-NotFound-Message': 'The requested record was not found.\nIt may have been deleted or the URL may be incorrect.',
    'Modal-NotFound-Title': 'Record not found',
    'RibbonGroup-Page': 'Page',
  },
  pt: {
    'TopBar-Sidebar-Toggle': 'Alternar menu',
    'TopBar-Notifications-Title': 'Notificações',
    'TopBar-Notifications-Empty': 'Nenhuma notificação',
    'TopBar-Notifications-MarkAllRead': 'Marcar todas como lidas',
    'Main-Logout': 'Sair',
    'Main-Logout-Modal-Message': 'Tem certeza de que deseja sair?',
    'Main-Logout-Modal-Message-Cancel': 'Cancelar',
    'Main-Logout-Modal-Message-Confirm': 'Sair',
    'LanguageSelector-Title': 'Selecionar idioma',
    'Language-en': 'Inglês',
    'Language-pt': 'Português',
    // Framework button and modal labels — shared by every library's Storybook.
    'Button-Cancel-Edit': 'Cancelar',
    'Button-Delete': 'Excluir',
    'Button-Edit': 'Editar',
    'Button-Modal-Cancel': 'Cancelar',
    'Button-Modal-Close': 'Fechar',
    'Button-New': 'Novo',
    'Button-Open-Record': 'Abrir',
    'Button-Refresh': 'Atualizar',
    'Button-Save': 'Salvar',
    'Button-Save-And-Close': 'Salvar e Fechar',
    'Button-Save-And-New': 'Salvar e Novo',
    'Button-Views': 'Visões',
    'Modal-Delete-Confirm': 'Confirmar exclusão',
    'Modal-Delete-Message': 'Você está prestes a excluir registros do sistema, não é possível reverter esta ação. Tem certeza que deseja continuar?',
    'Modal-Delete-Title': 'Confirmação da exclusão do registro',
    'Modal-Failed-Administrator': 'Se o problema persistir, por favor, entre em contato com o administrador.',
    'Modal-Failed-DefaultMessage': 'Ocorreu um erro no servidor. Por favor, tente novamente mais tarde.',
    'Modal-Failed-Title': 'Ocorreu um erro',
    'Modal-NotFound-Message': 'O registro solicitado não foi encontrado.\nEle pode ter sido excluído ou a URL pode estar incorreta.',
    'Modal-NotFound-Title': 'Registro não encontrado',
    'RibbonGroup-Page': 'Página',
  },
};

class StorybookTranslateLoader implements TranslateLoader {
  public getTranslation(lang: string): Observable<Record<string, string>> {
    return of(storybookTranslations[lang] ?? {});
  }
}

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
    translateService.addLangs(['en', 'pt']);
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
      useClass: StorybookTranslateLoader,
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
