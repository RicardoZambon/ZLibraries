import {
  Component,
  forwardRef,
  inject,
  input,
  InputSignal,
  OnInit,
  signal,
  Signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { FormGroupDirective } from '@angular/forms';
import {
  DataGridDataset,
  DisplayControls,
  FormService,
  ModalComponent,
  ModalSize,
  RibbonButtonComponent,
  RibbonGroupChild,
} from '@zambon-dev/ui/library';
import { TranslatePipe } from '@ngx-translate/core';
import { takeUntil } from 'rxjs';
import { BaseButton } from '../base-button';
import { ButtonComponent } from '@zambon-dev/ui/library';

@Component({
  selector: 'framework-button-filters',
  templateUrl: './button-filters.component.html',
  styleUrls: ['./button-filters.component.scss'],
  imports: [ButtonComponent, ModalComponent, RibbonButtonComponent, TranslatePipe],
  providers: [FormService, { provide: RibbonGroupChild, useExisting: forwardRef(() => ButtonFiltersComponent) }],
})
export class ButtonFiltersComponent extends BaseButton implements OnInit {
  //#region ViewChilds, Inputs, Outputs
  public readonly modal: Signal<ModalComponent | undefined> = viewChild(ModalComponent);

  public readonly modalSize: InputSignal<ModalSize> = input<ModalSize>('xl');
  public readonly modalTitle: InputSignal<string> = input('');
  public readonly validateFormFunction: InputSignal<(() => void) | undefined> = input<() => void>();
  //#endregion

  //#region Variables
  protected gridDataset: DataGridDataset = inject(DataGridDataset);
  protected readonly formGroup: FormGroupDirective = inject(FormGroupDirective);

  // A signal rather than a field: submitting or clearing the filters changes which buttons the
  // ribbon shows, and both happen from a click handler deep inside the modal.
  private readonly filters: WritableSignal<{ [key: string]: string }> = signal({});
  //#endregion

  //#region Properties
  protected get hasFiltersApplied(): boolean {
    return Object.keys(this.filters()).length > 0;
  }

  protected get singleColumn(): boolean {
    const modalSize: ModalSize = this.modalSize();
    return modalSize === 'sm' || modalSize === 'md' || modalSize === 'lg' || modalSize === 'xl';
  }
  //#endregion

  //#region Constructor and Angular life cycle methods
  constructor() {
    super();

    // This will force the screen to initialize with the filter disabled.
    this.disabled.set(true);
  }

  public ngOnInit(): void {
    // The constructor disables the button and the two subscriptions below are what re-enable it,
    // which is right only for a button that exists before its grid first loads. A ribbon template
    // is re-created whenever a record's views are switched, so a button built then arrives at a
    // grid that finished loading long ago, waits for an event that has already passed, and stays
    // unclickable until something makes the grid load again. The dataset knows either way.
    this.disabled.set(this.gridDataset.isLoading || !this.gridDataset.hasBeenLoaded);

    this.gridDataset.loadStarted.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.disabled.set(true);
      this.finishLoadingIfStarted();
    });

    this.gridDataset.loadFinished.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.disabled.set(false);
      this.finishLoadingIfStarted();
    });
  }
  //#endregion

  //#region Event handlers
  protected onFiltersButtonClicked(): void {
    this.modal()?.toggleModal();
    this.formGroup.form.reset();
    this.formGroup.form.patchValue(this.filters(), { emitEvent: false });
  }

  protected onFiltersSubmitClicked(): void {
    const validateFormFunction: (() => void) | undefined = this.validateFormFunction();
    if (validateFormFunction) {
      validateFormFunction();
    }

    if (this.formGroup.form.valid) {
      this.startLoading();
      this.modal()?.toggleModal();

      const formValue: any = this.formGroup.form.getRawValue();
      const formFilters: { [key: string]: any } = Object.fromEntries(
        Object.entries(formValue).filter(([_, v]) => (!!v && v !== '') || v === 0),
      );

      this.setFilters(formFilters);
    }
  }

  protected onResetButtonClicked(): void {
    this.startLoading();

    this.formGroup.form.reset();
    this.filters.set({});

    this.gridDataset.setFilters();
  }
  //#endregion

  //#region Public methods
  public setFilters(filters: { [key: string]: any }): void {
    // Kept whole, because reopening the modal patches this straight back into the form and a
    // catalog select backed by a search endpoint cannot recover its label from the identifier --
    // it only resolves a display from a local entries list. Dropping the labels here would leave
    // the field showing a selection with no text.
    this.filters.set(filters);

    if (this.hasFiltersApplied) {
      this.gridDataset.setFilters(this.withoutDisplayControls(filters));
    } else {
      this.gridDataset.setFilters();
    }
  }
  //#endregion

  //#region Private methods
  private finishLoadingIfStarted(): void {
    if (this.button()?.loading()) {
      this.finishLoading('success');
    }
  }

  /**
   * Drops the controls that only hold a catalog selection's label.
   *
   * They are half of how `lib-catalog-select` works and are created by it, so a screen never asked
   * for them and a backend has no filter behind them. Sent anyway they are dead weight, and worse:
   * the day a service does filter by a name, it would receive the formatted label rather than the
   * stored value and quietly match nothing.
   *
   * @param filters The filters as submitted.
   * @returns The filters a backend should receive.
   */
  private withoutDisplayControls(filters: { [key: string]: string }): { [key: string]: string } {
    return Object.fromEntries(
      Object.entries(filters).filter(
        ([key]: [string, string]) => !DisplayControls.isDisplayControl(this.formGroup.form.get(key)),
      ),
    );
  }
  //#endregion
}
