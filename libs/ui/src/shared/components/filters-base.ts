import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ButtonFiltersComponent } from '@zambon-dev/ui/framework';
import { Subject } from 'rxjs';

/**
 * Base class for a ribbon filter panel. Subclasses build the filter form in `formSetup()` and place
 * a `framework-button-filters` in their template, which applies the form to the grid.
 */
// No strategy on purpose: Angular never inherits `changeDetection`, so one declared here would
// describe a class that is never instantiated, while every subclass compiles to whatever it
// declares -- which in v22 means OnPush. Correctness comes from the state below notifying
// Angular, never from this decorator. See docs/guides/reactivity.md.
@Component({ template: '' })
export abstract class FiltersBase implements OnInit, OnDestroy {
  //#region ViewChilds, Inputs, Outputs
  @ViewChild(ButtonFiltersComponent) protected buttonFilters?: ButtonFiltersComponent;
  //#endregion

  //#region Variables
  protected destroy$: Subject<boolean> = new Subject<boolean>();
  protected filterForm!: FormGroup;
  protected formBuilder: FormBuilder = inject(FormBuilder);
  //#endregion

  //#region Properties
  //#endregion

  //#region Constructor and Angular life cycle methods

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  public ngOnInit(): void {
    this.filterForm = this.formSetup();
  }
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  /** Fills the filter form with the given values and applies them through the filters button. */
  public setFilters(filters: { [key: string]: any }): void {
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
