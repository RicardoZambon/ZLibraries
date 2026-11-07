import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, Input, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DataProviderService, FormService } from '@zambon-dev/ui/library';
import { Observable, take, tap, throwError } from 'rxjs';
import { ViewBase } from '../view-base';

// No strategy on purpose: Angular never inherits `changeDetection`, so one declared here would
// describe a class that is never instantiated, while every subclass compiles to whatever it
// declares -- which in v22 means OnPush. Correctness comes from the state below notifying
// Angular, never from this decorator. See docs/guides/reactivity.md.
/**
 * Base for a form embedded in another view. Takes the record through `model`, switches between view
 * and edit mode, and saves through `saveModel()`.
 *
 * @deprecated Use {@link FormView} instead. Migrate by extending FormView
 * and using standalone component imports with inject() for dependency injection.
 */
@Component({ template: '' })
export abstract class LegacySubViewForm extends ViewBase implements OnInit {
  /** ID of the record being edited. Leave it empty for a new record, which opens the form in edit mode. */
  @Input() entityId?: number;
  /** The record shown in the form. A new value is patched into the form. */
  @Input() set model(value: any | null) {
    if (this._model !== value) {
      this._model = value;

      if (this.dataForm) {
        this.dataForm.patchValue(this.model);
      }
    }
  }

  /** Whether the form is busy. Writes go to `FormService.loading`. */
  override get loading(): boolean {
    return false;
    return this.formService.loading;
  }

  /** Marks the form as busy (`true`) or idle (`false`) through `FormService`. */
  override set loading(value: boolean) {
    this.formService.loading = value;
  }

  /** `true` when there is no `entityId`, meaning the form holds a new record. */
  get isNew(): boolean {
    return !this.entityId;
  }

  // A signal rather than a field: the legacy edit and save buttons decide what to render from
  // `form.viewMode`, and this flips inside beginEdit/cancelEdit with nothing marking their views
  // dirty. The accessors keep the old shape.
  /** Whether the form is read-only (`view`) or being edited (`edit`). Starts as `view`. */
  get viewMode(): 'view' | 'edit' {
    return this._viewMode();
  }

  /** Switches the form between `view` and `edit` mode. Prefer `beginEdit()` and `cancelEdit()`. */
  set viewMode(value: 'view' | 'edit') {
    this._viewMode.set(value);
  }
  /** The record shown in the form, or `null` before one is set. */
  get model(): any | null {
    return this._model;
  }

  /** The form built by `formSetup()`. */
  dataForm!: FormGroup;

  private _model: any | null = null;
  private readonly _viewMode: WritableSignal<'view' | 'edit'> = signal('view');

  protected dataProvider: DataProviderService<any> | null;

  constructor(
    protected formBuilder: FormBuilder,
    protected formService: FormService,
  ) {
    super();

    this.dataProvider = inject(DataProviderService, { optional: true });
  }

  ngOnInit(): void {
    this.dataForm = this.formSetup();

    this.updateModel(this.model);

    if (this.dataProvider) {
      this.formService.loading = true;

      this.dataProvider
        .getModel$()
        .pipe(take(1))
        .subscribe((_: any) => {
          this.formService.loading = false;
        });
    }
  }

  protected updateModel(model: any): void {
    this._model = model;

    if (this.isNew) {
      this.beginEdit();
    } else {
      this.cancelEdit();
    }
  }

  /**
   * Switches to edit mode and enables the form.
   *
   * @param resetValues Whether to reload the form with the values of `model`. Defaults to `true`.
   */
  beginEdit(resetValues = true): void {
    setTimeout(() => {
      this.viewMode = 'edit';
      this.dataForm.enable();

      if (resetValues) {
        this.dataForm.patchValue(this.model);
      }
    });
  }

  /** Discards changes: restores the values of `model`, disables the form and returns to view mode. */
  cancelEdit(): void {
    this.viewMode = 'view';
    this.dataForm.patchValue(this.model);
    this.dataForm.disable();
  }

  /** Extension point: subclasses override this to validate before save. */
  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  protected validate(_formModel: any): void {}

  /**
   * Validates the form and saves it through `saveModel()`. When the form is invalid, marks every
   * control as touched and returns an observable that fails with a 400 error.
   */
  save(): Observable<any> {
    this.validate(this.dataForm.getRawValue());

    if (this.dataForm.valid) {
      this.dataForm.disable();

      return this.saveModel().pipe(tap(() => this.dataForm.enable()));
    } else {
      this.dataForm.markAllAsTouched();
      return throwError(() => new HttpErrorResponse({ error: { message: 'Form invalid', errors: null }, status: 400 }));
    }
  }

  protected abstract formSetup(): FormGroup;
  protected abstract saveModel(): Observable<any>;
}
