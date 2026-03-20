import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Tab, FRAMEWORK_VIEW_TYPE, FrameworkViewType } from '../../../models';
import { RouteHelper } from '../../../helpers';
import { ButtonSaveComponent } from './button-save.component';

// Test the navigation logic of ButtonSaveComponent by calling onButtonClicked
// through a minimal instance with mocked dependencies.

describe('ButtonSaveComponent \u2014 navigation logic', () => {
  let component: any;
  let mockTabService: {
    navigateCurrentTab: jest.Mock;
    navigateBackOrCloseActiveTab: jest.Mock;
    redirectCurrentTab: jest.Mock;
    isUrlActive: jest.Mock;
    setRouteRedirect: jest.Mock;
    updateTabTitle: jest.Mock;
  };
  let mockRouter: { routerState: any; navigateByUrl: jest.Mock };
  let mockFormService: {
    loading: boolean;
    isEditMode: boolean;
    isValid: boolean;
    markAllAsTouched: jest.Mock;
    enableForm: jest.Mock;
    disableForm: jest.Mock;
    cancelEdit: jest.Mock;
    model: any;
    getModelFromForm: jest.Mock;
    setValidationErrorsFromHttpResponse: jest.Mock;
  };
  let mockDataProviderService: {
    saveModel: jest.Mock;
    updateModel: jest.Mock;
    resetForNewEntity: jest.Mock;
    getTitle: jest.Mock;
  };
  let mockButton: {
    startLoading: jest.Mock;
    finishLoading: jest.Mock;
  };
  let mockErrorModal: {
    showModal: jest.Mock;
  };

  function setupDetailsRoute(parentUrl: string): void {
    const parentSnapshot: any = {
      url: parentUrl.split('/').filter(Boolean).map((p: string) => ({ path: p })),
      data: {},
      firstChild: null,
      parent: null,
    };
    const detailsSnapshot: any = {
      url: [{ path: ':id' }],
      data: { [FRAMEWORK_VIEW_TYPE]: FrameworkViewType.Details, defaultTitle: 'New Entity' },
      firstChild: null,
      parent: parentSnapshot,
    };
    mockRouter.routerState = {
      root: {
        snapshot: {
          url: [],
          data: {},
          firstChild: detailsSnapshot,
          parent: null,
        },
      },
    };

    jest.spyOn(RouteHelper, 'getRouteByData').mockReturnValue(detailsSnapshot);
    jest.spyOn(RouteHelper, 'getRouteURL').mockImplementation((route: any) => {
      if (route === detailsSnapshot.parent) {
        return parentUrl;
      }
      if (route === detailsSnapshot) {
        return `${parentUrl}/new`;
      }
      return parentUrl;
    });
  }

  function lastNavigatedTab(): Tab {
    return mockTabService.navigateCurrentTab.mock.calls[
      mockTabService.navigateCurrentTab.mock.calls.length - 1
    ][0];
  }

  beforeEach(() => {
    mockTabService = {
      navigateCurrentTab: jest.fn(),
      navigateBackOrCloseActiveTab: jest.fn(),
      redirectCurrentTab: jest.fn(),
      isUrlActive: jest.fn().mockReturnValue(false),
      setRouteRedirect: jest.fn(),
      updateTabTitle: jest.fn(),
    };
    mockRouter = {
      routerState: { root: { snapshot: { url: [], data: {}, firstChild: null, parent: null } } },
      navigateByUrl: jest.fn().mockResolvedValue(true),
    };
    mockFormService = {
      loading: false,
      isEditMode: true,
      isValid: true,
      markAllAsTouched: jest.fn(),
      enableForm: jest.fn(),
      disableForm: jest.fn(),
      cancelEdit: jest.fn(),
      model: null,
      getModelFromForm: jest.fn().mockReturnValue({ id: 42, name: 'Test' }),
      setValidationErrorsFromHttpResponse: jest.fn(),
    };
    mockDataProviderService = {
      saveModel: jest.fn().mockReturnValue(of({ id: 42, name: 'Test' })),
      updateModel: jest.fn(),
      resetForNewEntity: jest.fn(),
      getTitle: jest.fn().mockReturnValue('Test'),
    };
    mockButton = {
      startLoading: jest.fn(),
      finishLoading: jest.fn(),
    };
    mockErrorModal = {
      showModal: jest.fn(),
    };

    component = Object.create(ButtonSaveComponent.prototype);
    component.options = [
      { id: 'save', label: 'Save', icon: 'fa-save' },
      { id: 'save-and-close', label: 'Save & Close', icon: 'fa-save' },
      { id: 'save-and-new', label: 'Save & New', icon: 'fa-save' },
    ];
    component.disabled = false;
    component.visible = true;
    component.isAccessLoaded = true;
    component.button = mockButton;

    (component as any).tabService = mockTabService;
    (component as any).router = mockRouter;
    (component as any).formService = mockFormService;
    (component as any).dataProviderService = mockDataProviderService;
    (component as any).errorModal = mockErrorModal;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Save (default option)', () => {
    it('should save model and redirect current tab URL (e.g., /new to /:id) with router sync', () => {
      setupDetailsRoute('/contratacoes');
      mockTabService.isUrlActive.mockReturnValue(false);

      component.onButtonClicked();

      expect(mockFormService.disableForm).toHaveBeenCalled();
      expect(mockDataProviderService.saveModel).toHaveBeenCalled();
      expect(mockDataProviderService.updateModel).toHaveBeenCalledWith({ id: 42, name: 'Test' });
      expect(mockTabService.redirectCurrentTab).toHaveBeenCalledWith('/contratacoes/42');
      // Route URL (/contratacoes/new) differs from saved URL (/contratacoes/42),
      // so the router must be synced invisibly via setRouteRedirect + navigateByUrl
      expect(mockTabService.setRouteRedirect).toHaveBeenCalledWith('/contratacoes/new', '/contratacoes/42');
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/contratacoes/42');
    });

    it('should redirect tab but skip router sync when route URL already matches saved URL', () => {
      setupDetailsRoute('/contratacoes');
      mockTabService.isUrlActive.mockReturnValue(false);
      // Override so detailsRoute URL matches saved URL (e.g., re-saving an existing entity)
      jest.spyOn(RouteHelper, 'getRouteURL').mockImplementation((route: any) => {
        if (route && route.data && route.data[FRAMEWORK_VIEW_TYPE]) {
          return '/contratacoes/42';
        }
        return '/contratacoes';
      });

      component.onButtonClicked();

      expect(mockDataProviderService.updateModel).toHaveBeenCalledWith({ id: 42, name: 'Test' });
      expect(mockTabService.redirectCurrentTab).toHaveBeenCalledWith('/contratacoes/42');
      // Route URL already matches saved URL, so no router sync needed
      expect(mockTabService.setRouteRedirect).not.toHaveBeenCalled();
      expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
    });

    it('should NOT redirect when URL is already active (already saved)', () => {
      setupDetailsRoute('/contratacoes');
      mockTabService.isUrlActive.mockReturnValue(true);

      component.onButtonClicked();

      expect(mockTabService.redirectCurrentTab).not.toHaveBeenCalled();
      expect(mockTabService.setRouteRedirect).not.toHaveBeenCalled();
      expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
    });

    it('should call finishLoading with success on successful save', () => {
      setupDetailsRoute('/contratacoes');

      component.onButtonClicked();

      expect(mockButton.finishLoading).toHaveBeenCalledWith('success');
    });

    it('should enable form and cancel edit after successful save', () => {
      setupDetailsRoute('/contratacoes');

      component.onButtonClicked();

      expect(mockFormService.enableForm).toHaveBeenCalled();
      expect(mockFormService.cancelEdit).toHaveBeenCalled();
    });
  });

  describe('Save & Close', () => {
    it('should call navigateBackOrCloseActiveTab after saving', () => {
      setupDetailsRoute('/contratacoes');

      component.onButtonClicked('save-and-close');

      expect(mockDataProviderService.saveModel).toHaveBeenCalled();
      expect(mockTabService.navigateBackOrCloseActiveTab).toHaveBeenCalled();
    });

    it('should NOT call redirectCurrentTab', () => {
      setupDetailsRoute('/contratacoes');

      component.onButtonClicked('save-and-close');

      expect(mockTabService.redirectCurrentTab).not.toHaveBeenCalled();
    });
  });

  describe('Save & New', () => {
    describe('from new entity (router URL differs from saved URL)', () => {
      it('should sync router via redirect, then navigate to /new (real navigation for caching)', async () => {
        setupDetailsRoute('/contratacoes');

        component.onButtonClicked('save-and-new');

        expect(mockDataProviderService.updateModel).toHaveBeenCalledWith({ id: 42, name: 'Test' });
        expect(mockTabService.redirectCurrentTab).toHaveBeenCalledWith('/contratacoes/42');
        expect(mockTabService.setRouteRedirect).toHaveBeenCalledWith('/contratacoes/new', '/contratacoes/42');
        expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/contratacoes/42');

        await mockRouter.navigateByUrl.mock.results[0].value;

        // After navigateByUrl resolves, navigateToNew does a real navigation (no redirect)
        // so the /{id} component is detached and cached by the reuse strategy.
        expect(mockTabService.setRouteRedirect).toHaveBeenCalledTimes(1);
        expect(mockTabService.navigateCurrentTab).toHaveBeenCalledTimes(1);
        const tab: Tab = lastNavigatedTab();
        expect(tab.url).toBe('/contratacoes/new');
        expect(tab.entityBaseUrl).toBe('/contratacoes/new');
      });
    });

    describe('from existing entity (router URL matches saved URL)', () => {
      it('should navigate directly to /new (real navigation for caching)', () => {
        setupDetailsRoute('/contratacoes');
        // Override so detailsRoute URL matches saved URL
        jest.spyOn(RouteHelper, 'getRouteURL').mockImplementation((route: any) => {
          if (route && route.data && route.data[FRAMEWORK_VIEW_TYPE]) {
            return '/contratacoes/42';
          }
          return '/contratacoes';
        });

        component.onButtonClicked('save-and-new');

        expect(mockTabService.redirectCurrentTab).not.toHaveBeenCalled();
        expect(mockTabService.setRouteRedirect).not.toHaveBeenCalled();
        expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();

        expect(mockTabService.navigateCurrentTab).toHaveBeenCalledTimes(1);
        const tab: Tab = lastNavigatedTab();
        expect(tab.url).toBe('/contratacoes/new');
        expect(tab.entityBaseUrl).toBe('/contratacoes/new');
      });
    });

    it('should NOT call navigateBackOrCloseActiveTab', () => {
      setupDetailsRoute('/contratacoes');

      component.onButtonClicked('save-and-new');

      expect(mockTabService.navigateBackOrCloseActiveTab).not.toHaveBeenCalled();
    });
  });

  describe('Validation failure', () => {
    it('should NOT save when form is invalid', () => {
      mockFormService.isValid = false;

      component.onButtonClicked();

      expect(mockFormService.markAllAsTouched).toHaveBeenCalled();
      expect(mockFormService.disableForm).not.toHaveBeenCalled();
      expect(mockDataProviderService.saveModel).not.toHaveBeenCalled();
      expect(mockButton.finishLoading).toHaveBeenCalledWith('warning');
    });
  });

  describe('Save error handling', () => {
    it('should handle 400 validation errors from backend', () => {
      const errorResponse: HttpErrorResponse = new HttpErrorResponse({
        status: 400,
        error: { name: ['Name is required'] },
      });
      mockDataProviderService.saveModel.mockReturnValue(throwError(() => errorResponse));

      component.onButtonClicked();

      expect(mockFormService.setValidationErrorsFromHttpResponse).toHaveBeenCalledWith(errorResponse);
      expect(mockButton.finishLoading).toHaveBeenCalledWith('warning');
      expect(mockFormService.enableForm).toHaveBeenCalled();
    });

    it('should show error modal for non-400 errors with string message', () => {
      const errorResponse: HttpErrorResponse = new HttpErrorResponse({
        status: 500,
        error: 'Internal Server Error',
      });
      mockDataProviderService.saveModel.mockReturnValue(throwError(() => errorResponse));

      component.onButtonClicked();

      expect(mockErrorModal.showModal).toHaveBeenCalledWith('Internal Server Error');
      expect(mockButton.finishLoading).toHaveBeenCalledWith('warning');
    });

    it('should show default error message for non-400 errors without string message', () => {
      const errorResponse: HttpErrorResponse = new HttpErrorResponse({
        status: 500,
        error: { complex: 'object' },
      });
      mockDataProviderService.saveModel.mockReturnValue(throwError(() => errorResponse));

      component.onButtonClicked();

      expect(mockErrorModal.showModal).toHaveBeenCalledWith('Modal-Failed-DefaultMessage');
    });
  });

  describe('Properties', () => {
    it('isFormLoading should reflect formService.loading', () => {
      mockFormService.loading = true;
      expect(component.isFormLoading).toBe(true);

      mockFormService.loading = false;
      expect(component.isFormLoading).toBe(false);
    });

    it('isFormEditMode should reflect formService.isEditMode', () => {
      mockFormService.isEditMode = true;
      expect(component.isFormEditMode).toBe(true);

      mockFormService.isEditMode = false;
      expect(component.isFormEditMode).toBe(false);
    });
  });

  describe('Constructor defaults', () => {
    it('should have three options: save, save-and-close, save-and-new', () => {
      expect(component.options.length).toBe(3);
      expect(component.options[0].id).toBe('save');
      expect(component.options[1].id).toBe('save-and-close');
      expect(component.options[2].id).toBe('save-and-new');
    });
  });
});
