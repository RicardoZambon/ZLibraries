import { NgIf } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, forwardRef, inject, Input, ViewChild } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { DataProviderService, FormService, RibbonButtonComponent, RibbonGroupChild } from '@library';
import { Observable, take, throwError } from 'rxjs';
import { RouteHelper } from '../../../helpers';
import { FRAMEWORK_VIEW_TYPE, FrameworkViewType, ITab, Tab } from '../../../models';
import { TabService } from '../../../services';
import { ErrorModalComponent } from '../../modals/error-modal/error-modal.component';
import { BaseButton } from '../base-button';

@Component({
  selector: 'framework-button-save',
  templateUrl: './button-save.component.html',
  imports: [
    ErrorModalComponent,
    NgIf,
    RibbonButtonComponent,
  ],
  providers: [{ provide: RibbonGroupChild, useExisting: forwardRef(() => ButtonSaveComponent)}]
})
export class ButtonSaveComponent extends BaseButton {
  //#region ViewChilds, Inputs, Outputs
  @ViewChild(ErrorModalComponent) private errorModal!: ErrorModalComponent;

  @Input() public defaultOption: number = 0;
  //#endregion

  //#region Variables
  //#endregion

  //#region Properties
  protected get isFormLoading(): boolean {
    return this.formService.loading;
  }

  protected get isFormEditMode(): boolean {
    return this.formService.isEditMode;
  }
  //#endregion

  private dataProviderService: DataProviderService<any> = inject(DataProviderService);
  private formService: FormService = inject(FormService);
  private router: Router = inject(Router);
  private tabService: TabService = inject(TabService);
  //#endregion

  //#region Constructor and Angular life cycle methods
  constructor() {
    super();

    this.options = [
      { id: 'save', label: 'Button-Save', icon: 'fa-save' },
      { id: 'save-and-close', label: 'Button-Save-And-Close', icon: 'fa-save' },
      { id: 'save-and-new', label: 'Button-Save-And-New', icon: 'fa-save' },
    ];
  }
  //#endregion

  //#region Event handlers
  protected onButtonClicked(option?: string): void {
    this.startLoading();

    this.formService.markAllAsTouched();
    if (!this.formService.isValid) {
      this.finishLoading('warning');
      return;
    }

    this.saveModel()
      .pipe(take(1))
      .subscribe({
        next: (model: any) => {
          this.finishLoading('success');
          this.formService.enableForm();
          this.formService.model = model;
          this.formService.cancelEdit();

          switch (option) {
            case 'save-and-close':
              this.tabService.navigateBackOrCloseActiveTab();
              break;
            case 'save-and-new': {
              this.dataProviderService.updateModel(model);

              const detailsRoute: ActivatedRouteSnapshot | null = RouteHelper.getRouteByData(this.router.routerState.root.snapshot, FRAMEWORK_VIEW_TYPE, FrameworkViewType.Details);
              const savedEntityUrl: string = `${RouteHelper.getRouteURL(detailsRoute!.parent!)}/${model.id}`;
              const currentRouteUrl: string = RouteHelper.getRouteURL(detailsRoute!);

              if (currentRouteUrl !== savedEntityUrl) {
                // Router URL differs from saved entity (new entity, or regular save
                // that only used location.replaceState). Redirect to sync the router
                // to /{id} invisibly, then navigate to /new normally. The real second
                // navigation detaches and caches the /{id} component so back-navigation
                // reattaches it instantly without reloading from the server.
                this.tabService.redirectCurrentTab(savedEntityUrl);
                this.tabService.setRouteRedirect(currentRouteUrl, savedEntityUrl);
                this.router.navigateByUrl(savedEntityUrl).then(() => {
                  this.navigateToNew();
                });
              } else {
                // Router is already at /{id}. Navigate to /new directly.
                // The /{id} component is cached by the reuse strategy.
                this.navigateToNew();
              }
              break;
            }
            default:
              this.dataProviderService.updateModel(model);

              const targetRoute: ActivatedRouteSnapshot | null = RouteHelper.getRouteByData(this.router.routerState.root.snapshot, FRAMEWORK_VIEW_TYPE, FrameworkViewType.Details);
              const url: string = `${RouteHelper.getRouteURL(targetRoute!.parent!)}/${model.id}`;

              if (!this.tabService.isUrlActive(url)) {
                const currentRoute: string = RouteHelper.getRouteURL(targetRoute!);
                this.tabService.redirectCurrentTab(url);

                // Sync the Angular router to /{id} invisibly. Without this, the router
                // stays at the old URL (e.g., /new) and subsequent navigations to that
                // URL become no-ops (the New button would stop working after Save).
                if (currentRoute !== url) {
                  this.tabService.setRouteRedirect(currentRoute, url);
                  this.router.navigateByUrl(url);
                }
              }
              break;
          }
        },
        error: (e: HttpErrorResponse) => {
          this.finishLoading('warning');
          this.formService.enableForm();

          if (e.status === 400) {
            this.formService.setValidationErrorsFromHttpResponse(e);
          } else {
            let errorMessage: string = 'Modal-Failed-DefaultMessage';
            if (typeof e.error === 'string') {
              errorMessage = e.error;
            }
            this.errorModal.showModal(errorMessage);
          }
        },
        complete: () => {
          this.formService.loading = false;
        }
      });
  }
  //#endregion

  //#region Public methods
  public override finishLoading(status: 'failure' | 'warning' | 'success'): void {
    super.finishLoading(status);
  }
  //#endregion

  //#region Private methods
  private navigateToNew(): void {
    const targetRoute: ActivatedRouteSnapshot | null = RouteHelper.getRouteByData(this.router.routerState.root.snapshot, FRAMEWORK_VIEW_TYPE, FrameworkViewType.Details);

    let url: string = '';
    if (targetRoute) {
      url = RouteHelper.getRouteURL(targetRoute.parent!);
    } else {
      url = RouteHelper.getRouteURL(this.router.routerState.root.snapshot, true);
    }

    const tab: ITab = new Tab({ entityBaseUrl: `${url}/new`, url: `${url}/new` });
    this.tabService.navigateCurrentTab(tab);
  }

  private saveModel(): Observable<any> {
    this.formService.disableForm();
    const model: any = this.formService.getModelFromForm();
    return this.dataProviderService.saveModel(model);
  }
  //#endregion
}
