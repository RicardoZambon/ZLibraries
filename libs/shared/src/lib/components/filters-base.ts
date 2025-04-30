import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ButtonFiltersComponent } from '@framework';
import { Subject } from 'rxjs';

@Component({ template: '' })
export abstract class FiltersBase implements OnInit, OnDestroy {
  //#region ViewChilds, Inputs, Outputs
  @ViewChild(ButtonFiltersComponent) protected buttonFilters?: ButtonFiltersComponent;
  //#endregion

  //#region Variables
  protected destroy$: Subject<boolean> = new Subject<boolean>();
  protected filterForm!: FormGroup;
  //#endregion

  //#region Properties
  //#endregion
  
  //#region Constructor and Angular life cycle methods
  constructor(protected formBuilder: FormBuilder) {
  }

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  public ngOnInit(): void {
    this.filterForm = this.formSetup();
  }
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  public setFilters(filters: { [key: string ] : any }): void {
    this.filterForm.patchValue(filters);

    setTimeout(() => {
      if (this.buttonFilters) {
        this.buttonFilters.setFilters(filters);
      }
    });
  }
  //#endregion

  //#region Private methods
  //#endregion

  //#region Abstract methods
  protected abstract formSetup(): FormGroup<any>;
  //#endregion
}