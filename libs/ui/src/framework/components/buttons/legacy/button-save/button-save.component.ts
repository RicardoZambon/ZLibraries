import { HttpErrorResponse } from '@angular/common/http';
import { Component, forwardRef, inject, input, InputSignal, Signal, viewChild } from '@angular/core';
import { FormService, RibbonButtonComponent, RibbonGroupChild } from '@zambon-dev/ui/library';
import { take } from 'rxjs';
import { BackendFormValidationHelper } from '../../../../helpers';
import { TabService } from '../../../../services';
import { LegacySubViewForm, LegacyTabViewDetails } from '../../../../views';
import { ErrorModalComponent } from '../../../modals/error-modal/error-modal.component';
import { BaseButton } from '../../base-button';

/**
 * Ribbon button that saves a legacy sub-view form, with Save, Save and close, and Save and new
 * options. Does nothing without `form`.
 *
 * @deprecated Use {@link ButtonSaveComponent} instead.
 */
@Component({
  selector: 'framework-button-save-legacy',
  templateUrl: './button-save.component.html',
  imports: [ErrorModalComponent, RibbonButtonComponent],
  providers: [{ provide: RibbonGroupChild, useExisting: forwardRef(() => ButtonSaveLegacyComponent) }],
})
export class ButtonSaveLegacyComponent extends BaseButton {
  //#region ViewChilds, Inputs, Outputs
  private readonly errorModal: Signal<ErrorModalComponent | undefined> = viewChild(ErrorModalComponent);

  /** Index of the option in `options` that the main button runs. Defaults to `0` (Save). */
  public readonly defaultOption: InputSignal<number> = input(0);
  /** Legacy form to save. The button is enabled only while it is in edit mode. */
  public readonly form: InputSignal<LegacySubViewForm | undefined> = input<LegacySubViewForm>();
  /** Details view to mark as loading while saving. Its New button runs for Save and new. */
  public readonly tabView: InputSignal<LegacyTabViewDetails | undefined> = input<LegacyTabViewDetails>();
  //#endregion

  //#region Variables
  private formService: FormService = inject(FormService);
  private tabService: TabService = inject(TabService);
  //#endregion

  //#region Properties
  //#endregion

  //#region Constructor and Angular life cycle methods
  constructor() {
    super();

    this.options.set([
      { id: 'save', label: 'Button-Save', icon: 'fa-save' },
      { id: 'save-and-close', label: 'Button-Save-And-Close', icon: 'fa-save' },
      { id: 'save-and-new', label: 'Button-Save-And-New', icon: 'fa-save' },
    ]);
  }
  //#endregion

  //#region Event handlers
  protected onButtonClick(option?: string): void {
    const form: LegacySubViewForm | undefined = this.form();
    if (!form) {
      return;
    }

    this.startLoading();
    this.setTabViewLoading(true);

    form
      .save()
      .pipe(take(1))
      .subscribe({
        next: (model: any) => {
          this.finishLoading('success');

          this.formService.model = model;
          form.cancelEdit();

          switch (option) {
            case 'save-and-close':
              this.tabService.closeActiveTab();
              // this.tabService.closeTab(this.tabView);
              break;
            case 'save-and-new':
              this.tabView()?.buttonNew?.clicked();
              break;
          }
        },
        error: (e: HttpErrorResponse) => {
          this.finishLoading('warning');
          form.beginEdit(false);

          if (e.status === 400) {
            BackendFormValidationHelper.validateAllFormFields(e, form.dataForm);
          } else {
            let errorMessage = 'Modal-Failed-DefaultMessage';
            if (typeof e.error === 'string') {
              errorMessage = e.error;
            }

            this.errorModal()?.showModal(errorMessage);
          }
        },
      });
  }
  //#endregion

  //#region Public methods
  /** Stops the spinner, clears the tab view's loading flag and briefly shows the outcome. */
  public override finishLoading(status: 'failure' | 'warning' | 'success'): void {
    this.setTabViewLoading(false);
    super.finishLoading(status);
  }
  //#endregion

  //#region Private methods
  private setTabViewLoading(isLoading: boolean): void {
    const tabView: LegacyTabViewDetails | undefined = this.tabView();
    if (tabView) {
      tabView.loading = isLoading;
    }
  }
  //#endregion
}
