import { NgIf } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, forwardRef, Input, ViewChild } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { DataProviderService, FormService, RibbonButtonComponent, RibbonGroupChild } from '@library';
import { Observable, take, throwError } from 'rxjs';
import { RouteHelper } from '../../../helpers';
import { AuthService, TabService } from '../../../services';
import { ErrorModalComponent } from '../../modals/error-modal/error-modal.component';
import { DefaultDetailsTabViewComponent } from '../../views';
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

  //#region Constructor and Angular life cycle methods
  constructor(
    private dataProviderService: DataProviderService<any>,
    private formService: FormService,
    private router: Router,
    private tabService: TabService,
    authService: AuthService,
  ) {
    super(authService);

    this.options = [
      { id: 'save', label: 'Save', icon: 'fa-save' },
      { id: 'save-and-close', label: 'Save & Close', icon: 'fa-save' },
      { id: 'save-and-new', label: 'Save & New', icon: 'fa-save' },
    ];
  }
  //#endregion

  //#region Event handlers
  protected onButtonClicked(option?: string): void {
    this.startLoading();

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
              this.tabService.closeActiveTab();
              break;
            case 'save-and-new':
              // TODO: find a better way to access the view buttons.
              // this.tabView.buttonNew.();
              break;
            default:
              this.dataProviderService.updateModel(model);
              
              const targetRoute: ActivatedRouteSnapshot | null = RouteHelper.getRouteWithComponent(this.router.routerState.root.snapshot, DefaultDetailsTabViewComponent);
              const url: string = `${RouteHelper.getRouteURL(targetRoute!.parent!)}/${model.id}`;

              if (!this.tabService.isUrlActive(url)) {
                this.tabService.redirectCurrentTab(url);
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
  private saveModel(): Observable<any> {
    this.formService.markAllAsTouched();
    
    if (!this.formService.isValid) {
      return throwError(() => new HttpErrorResponse({ error: { message: 'Form invalid', errors: null }, status: 400 }));;
    }

    this.formService.disableForm();
    const model: any = this.formService.getModelFromForm();
    return this.dataProviderService.saveModel(model);
  }
  //#endregion
}