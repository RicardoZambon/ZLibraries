import { HttpErrorResponse } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Injectable()
export class FormService {
  //#region ViewChilds, Inputs, Outputs
  public fieldRefreshed = new EventEmitter<{ fieldName: string; value?: any; loading?: boolean; }>();
  public modelRefreshed = new EventEmitter<any | null>;
  //#endregion

  //#region Variables
  private _loading: boolean = false;
  private _model: any | null = null;
  private currentMode: 'edit' | 'view' = 'view';
  private form?: FormGroup;
  //#endregion

  //#region Properties
  public get isEditMode(): boolean {
    return this.currentMode === 'edit';
  }

  public get isValid(): boolean {
    return this.form?.valid ?? false;
  }

  public get loading(): boolean {
    return this._loading;
  }

  public set loading(value: boolean) {
    if (this._loading !== value) {
      this._loading = value;
      if (value)  {
        this.form?.disable();
      } else if (this.isEditMode) {
        this.form?.enable();
      }
    }
  }

  public get model(): any | null {
    return this._model;

  }

  public set model(value: any | null) {
    if (this._model !== value) {
      this._model = value;
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
    this.currentMode = 'edit';
    this.form?.enable();
  }

  public beginFieldLoading(fieldName: string) {
    this.fieldRefreshed.emit({
      fieldName,
      loading: true
    });
  }

  public cancelEdit(): void {
    this.currentMode = 'view';
    this.form?.disable();
    this.resetValues();
  }

  public getModelFromForm(): any {
    return this.form?.getRawValue();
  }

  public markAllAsTouched(): void {
    this.form?.markAllAsTouched();
  }

  public resetValues(): void {
    this.form?.reset();
    this.form?.updateValueAndValidity();

    if (this.model) {
      this.form?.patchValue(this.model);
    }
  }

  public setFieldValue(fieldName: string, value: any) {
    this.fieldRefreshed.emit({
      fieldName,
      value,
      loading: false
    });
  }

  public setupForm(form: FormGroup): void {
    this.form = form;

    if (this.currentMode === 'view') {
      this.form.disable();
    }
  }

  public setValidationErrorsFromHttpResponse(errorResponse: HttpErrorResponse): void {
    if (!errorResponse || !this.form) {
      return;
    }

    // Error 400 = Validation issues
    if (errorResponse.status === 400 && errorResponse.error && errorResponse.error.errors) {
      const errors: { [id: string]: string[] } = <{ [id: string]: string[] }>errorResponse.error.errors;
      
      Object.keys(errors)
        .map((x: string) => { return { key: x, field: x.substring(0, 1).toLocaleLowerCase() + x.substring(1, x.length) }; })
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