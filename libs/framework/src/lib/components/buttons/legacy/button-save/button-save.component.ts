import { NgIf } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, forwardRef, Input, ViewChild } from '@angular/core';
import { FormService, RibbonButtonComponent, RibbonGroupChild } from '@library';
import { take } from 'rxjs';
import { BackendFormValidationHelper } from '../../../../helpers';
import { AuthService, TabService } from '../../../../services';
import { LegacySubViewForm, LegacyTabViewDetails } from '../../../../views';
import { ErrorModalComponent } from '../../../modals/error-modal/error-modal.component';
import { BaseButton } from '../../base-button';

@Component({
  selector: 'framework-button-save-legacy',
  templateUrl: './button-save.component.html',
  imports: [
    ErrorModalComponent,
    NgIf,
    RibbonButtonComponent,
  ],
  providers: [{ provide: RibbonGroupChild, useExisting: forwardRef(() => ButtonSaveLegacyComponent)}]
})
export class ButtonSaveLegacyComponent extends BaseButton {
  //#region ViewChilds, Inputs, Outputs
  @ViewChild(ErrorModalComponent) errorModal!: ErrorModalComponent;

  @Input() public defaultOption: number = 0;
  @Input() public form?: LegacySubViewForm;
  @Input() public tabView!: LegacyTabViewDetails;
  //#endregion

  //#region Variables
  //#endregion

  //#region Properties
  //#endregion

  //#region Constructor and Angular life cycle methods
  constructor(
    private formService: FormService,
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
  protected onButtonClick(option?: string): void {
    if (!this.form) {
      return;
    }

    this.startLoading();
    this.tabView.loading = true;
    
    this.form.save()
    .pipe(take(1))
    .subscribe({
      next: (model: any) => {
        this.finishLoading('success');
        
        this.formService.model = model;
        this.form?.cancelEdit();

        switch (option) {
          case 'save-and-close':
            this.tabService.closeActiveTab();
            // this.tabService.closeTab(this.tabView);
            break;
          case 'save-and-new':
            if (this.tabView.buttonNew) {
              this.tabView.buttonNew.clicked();
            }
            break;
        }
      },
      error: (e: HttpErrorResponse) => {
        this.finishLoading('warning');
        this.form?.beginEdit(false);

        if (e.status === 400 && !!this.form) {
          BackendFormValidationHelper.validateAllFormFields(e, this.form.dataForm);
        } else {
          let errorMessage: string = 'Modal-Failed-DefaultMessage';
          if (typeof e.error === 'string') {
            errorMessage = e.error;
          }

          this.errorModal.showModal(errorMessage);
        }
      }
    });
  }
  //#endregion

  //#region Public methods
  public override finishLoading(status: 'failure' | 'warning' | 'success'): void {
    this.tabView.loading = false;
    super.finishLoading(status);
  }
  //#endregion

  //#region Private methods
  //#endregion


  
}