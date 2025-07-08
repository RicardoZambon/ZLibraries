import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DataProviderService, FormService } from '@library';
import { take } from 'rxjs';
import { TabViewBase } from './tabview-base';

@Component({ template: '' })
export abstract class FormView<TEntityModel> extends TabViewBase implements OnInit {
  //#region ViewChilds, Inputs, Outputs
  //#endregion

  //#region Variables
  protected dataForm!: FormGroup;
  protected dataProvider: DataProviderService<TEntityModel> | null;
  protected formBuilder: FormBuilder;
  protected formService: FormService;
  //#endregion

  //#region Properties
  protected get hasEntityID(): boolean {
    return this.dataProvider?.hasEntityID ?? false;
  }

  protected get isLoading(): boolean {
    return this.formService.loading;
  }
  //#endregion

  //#region Constructor and Angular life cycle methods
  constructor() {
    super();

    this.dataProvider = inject(DataProviderService, { optional: true });
    this.formBuilder = inject(FormBuilder);
    this.formService = inject(FormService);
  }

  public ngOnInit(): void {
    this.dataForm = this.formSetup();
    this.formService.initializeForm(this.dataForm);

    this.formService.loading = true;
    this.dataProvider?.getModel$()
      .pipe(take(1))
      .subscribe((model: TEntityModel | null) => {
        this.formService.loading = false;
        this.formService.model = model;
        this.formService.resetForm();

        if (!this.dataProvider?.hasEntityID) {
          this.formService.beginEdit();
        }
      });
  }
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  //#endregion

  //#region Private methods
  protected abstract formSetup(): FormGroup;
  //#endregion
}