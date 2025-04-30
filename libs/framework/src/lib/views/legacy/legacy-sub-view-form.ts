import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DataProviderService, FormService } from '@library';
import { Observable, take, tap, throwError } from 'rxjs';
import { ViewBase } from '../view-base';

@Component({ template: '' })
export abstract class LegacySubViewForm extends ViewBase implements OnInit {
  @Input() entityId?: number;
  @Input() set model(value: any | null) {
    if (this._model !== value) {
      this._model = value;
      
      if (this.dataForm) {
        this.dataForm.patchValue(this.model);
      }
    }
  }

  override get loading(): boolean {
    return false;
    return this.formService.loading;
  }

  override set loading(value: boolean) {
    this.formService.loading = value;
  }

  get isNew(): boolean {
    return !this.entityId;
  }
  get model(): any | null {
    return this._model;
  }

  dataForm!: FormGroup;
  viewMode: 'view' | 'edit' = 'view';

  private _model: any | null = null;

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

      this.dataProvider.getModel$()
        .pipe(take(1))
        .subscribe((_: any) => {
          this.formService.loading = false;
        })
    }
  }

  
  protected updateModel(model: any): void {
    this._model = model;

    if (this.isNew) {
      this.beginEdit();
    }
    else {
      this.cancelEdit();
    }
  }

  beginEdit(resetValues: boolean = true): void {
    setTimeout(() => {
      this.viewMode = 'edit';
      this.dataForm.enable();

      if (resetValues) {
        this.dataForm.patchValue(this.model);
      }
    });
  }

  cancelEdit(): void {
    this.viewMode = 'view';
    this.dataForm.patchValue(this.model);
    this.dataForm.disable();
  }

  protected validate(formModel: any): void {
  }

  save(): Observable<any> {
    
    this.validate(this.dataForm.getRawValue());
    
    if (this.dataForm.valid) {
      this.dataForm.disable();

      return this.saveModel()
      .pipe(
        tap(() => this.dataForm.enable())
      );
    }
    else {
      this.dataForm.markAllAsTouched();
      return throwError(() => new HttpErrorResponse({ error: { message: 'Form invalid', errors: null }, status: 400 }));
    }
  }

  protected abstract formSetup(): FormGroup;
  protected abstract saveModel(): Observable<any>;
}