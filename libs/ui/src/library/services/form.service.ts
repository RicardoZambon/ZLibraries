import { HttpErrorResponse } from '@angular/common/http';
import { EventEmitter, Injectable, signal, WritableSignal } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable, Subject, Subscription } from 'rxjs';

@Injectable()
export class FormService {
  //#region ViewChilds, Inputs, Outputs
  public fieldRefreshed = new EventEmitter<{ fieldName: string; value?: any; loading?: boolean }>();
  public modelRefreshed = new EventEmitter<any | null>();
  //#endregion

  //#region Variables
  // Signals rather than fields: these are read from templates through the accessors below, and a
  // plain assignment told Angular nothing. The accessors keep their old shape, so nothing that
  // reads or writes them has to change.
  private readonly _loading: WritableSignal<boolean> = signal(false);
  private readonly _model: WritableSignal<any | null> = signal(null);
  private readonly currentMode: WritableSignal<'edit' | 'view'> = signal('view');

  // A FormGroup's validity is not a signal and never notifies one, so its status is mirrored here
  // and `isValid` reads this. Without it a save button bound to isValid keeps its first answer.
  private readonly formStatus: WritableSignal<string | undefined> = signal(undefined);

  private editCanceled$: Subject<void> = new Subject<void>();
  private form?: FormGroup;
  // Held rather than tied to a DestroyRef: this service is also built directly in specs, outside
  // any injection context, and re-initialising with another form has to drop the old subscription.
  private formStatusSubscription?: Subscription;
  private initialValue?: any;
  //#endregion

  //#region Properties
  public get editCanceled(): Observable<void> {
    return this.editCanceled$.asObservable();
  }

  public get isEditMode(): boolean {
    return this.currentMode() === 'edit';
  }

  public get isValid(): boolean {
    this.formStatus();
    return this.form?.valid ?? false;
  }

  public get loading(): boolean {
    return this._loading();
  }

  public set loading(value: boolean) {
    if (this._loading() !== value) {
      this._loading.set(value);
      if (value) {
        this.form?.disable();
      } else if (this.isEditMode) {
        this.form?.enable();
      }
    }
  }

  public get model(): any | null {
    return this._model();
  }

  public set model(value: any | null) {
    if (this._model() !== value) {
      this._model.set(value);
      this.modelRefreshed.emit(value);
    }
  }
  //#endregion

  //#region Constructor and Angular life cycle methods
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  public beginEdit(): void {
    this.currentMode.set('edit');
    this.form?.enable();
  }

  public beginFieldLoading(fieldName: string) {
    this.fieldRefreshed.emit({
      fieldName,
      loading: true,
    });
  }

  public cancelEdit(): void {
    this.currentMode.set('view');
    this.form?.disable();
    this.resetForm();
    this.editCanceled$.next();
  }

  public disableForm(): void {
    this.form?.disable();
  }

  public enableForm(): void {
    if (this.isEditMode) {
      this.form?.enable();
    }
  }

  public getModelFromForm(): any {
    return this.form?.getRawValue();
  }

  public initializeForm(form: FormGroup): void {
    this.form = form;
    this.initialValue = form.getRawValue();

    this.formStatusSubscription?.unsubscribe();
    this.formStatus.set(form.status);
    this.formStatusSubscription = form.statusChanges.subscribe((status: string) => this.formStatus.set(status));

    if (this.currentMode() === 'view') {
      this.form.disable();
    }
  }

  public markAllAsTouched(): void {
    if (!this.form) {
      return;
    }

    this.form.markAllAsTouched();
  }

  public resetForm(): void {
    if (!this.form) {
      return;
    }

    this.form.reset();

    if (this.model) {
      this.form.patchValue(this.model);
    } else if (this.initialValue) {
      this.form.patchValue(this.initialValue);
    }

    this.form.updateValueAndValidity();
  }

  public setFieldValue(fieldName: string, value: any): void {
    this.fieldRefreshed.emit({
      fieldName,
      loading: false,
      value,
    });
  }

  public setValidationErrorsFromHttpResponse(errorResponse: HttpErrorResponse): void {
    if (!errorResponse || !this.form) {
      return;
    }

    // Error 400 = Validation issues
    if (errorResponse.status === 400 && errorResponse.error && errorResponse.error.errors) {
      const errors: { [id: string]: string[] } = <{ [id: string]: string[] }>errorResponse.error.errors;

      Object.keys(errors)
        .map((x: string) => {
          return { key: x, field: x.substring(0, 1).toLocaleLowerCase() + x.substring(1, x.length) };
        })
        .forEach((err: { key: string; field: string }) => {
          setTimeout(() => {
            const field: FormControl = <FormControl>this.form!.get(err.field);
            field?.setErrors({ [errors[err.key][0]]: true });
            field?.markAsTouched();
          });
        });
    }
  }
  //#endregion

  //#region Private methods
  //#endregion
}
