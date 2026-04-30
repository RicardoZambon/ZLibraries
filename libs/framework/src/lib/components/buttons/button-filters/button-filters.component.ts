import { NgIf } from '@angular/common';
import { Component, forwardRef, inject, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroupDirective } from '@angular/forms';
import { DataGridDataset, FormService, ModalComponent, RibbonButtonComponent, RibbonGroupChild } from '@library';
import { TranslatePipe } from '@ngx-translate/core';
import { takeUntil } from 'rxjs';
import { BaseButton } from '../base-button';

@Component({
  selector: 'framework-button-filters',
  templateUrl: './button-filters.component.html',
  styleUrls: ['./button-filters.component.scss'],
  imports: [
    ModalComponent,
    NgIf,
    RibbonButtonComponent,
    TranslatePipe,
  ],
  providers: [
    FormService,
    { provide: RibbonGroupChild, useExisting: forwardRef(() => ButtonFiltersComponent)},
  ]
})
export class ButtonFiltersComponent extends BaseButton implements OnInit {
  //#region ViewChilds, Inputs, Outputs
  @ViewChild(ModalComponent) modal!: ModalComponent;

  @Input() public modalSize: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full' | 'auto' = 'xl';
  @Input() public modalTitle!: string;
  @Input() public validateFormFunction?: Function;
  //#endregion

  //#region Variables
  protected readonly formGroup: FormGroupDirective = inject(FormGroupDirective);
  protected gridDataset: DataGridDataset = inject(DataGridDataset);

  private filters: { [key: string]: string; } = {};
  //#endregion

  //#region Properties
  protected get hasFiltersApplied(): boolean {
    return Object.keys(this.filters).length > 0;
  }

  protected get singleColumn(): boolean {
    return this.modalSize === 'sm' || this.modalSize === 'md' || this.modalSize === 'lg' || this.modalSize === 'xl';
  }
  //#endregion
  
  //#region Constructor and Angular life cycle methods
  constructor() {
    super();

    // This will force the screen to initialize with the filter disabled.
    this.disabled = true;
  }

  public ngOnInit(): void {
    this.gridDataset.loadStarted
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.disabled = true;
        if (this.button.loading) {
          this.finishLoading('success');
        }
      });

    this.gridDataset.loadFinished
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.disabled = false;
        if (this.button.loading) {
          this.finishLoading('success');
        }
      });
  }
  //#endregion

  //#region Event handlers
  protected onFiltersButtonClicked(): void {
    this.modal.toggleModal();
    this.formGroup.form.reset();
    this.formGroup.form.patchValue(this.filters, { emitEvent: false });
  }

  protected onFiltersSubmitClicked(): void {
    if (this.validateFormFunction) {
      this.validateFormFunction();
    }

    if (this.formGroup.form.valid) {
      this.button.startLoading();
      this.modal.toggleModal();
      
      const formValue: any = this.formGroup.form.getRawValue();
      const formFilters: { [key: string ] : any } = Object.fromEntries(Object.entries(formValue).filter(([_, v]) => (!!v && v !== '') || v === 0));

      this.setFilters(formFilters);
    }
  }

  protected onResetButtonClicked(): void {
    this.button.startLoading();
    
    this.formGroup.form.reset();
    this.gridDataset.setFilters();
    this.filters = this.gridDataset.filters ?? {};
    this.formGroup.form.patchValue(this.filters, { emitEvent: false });
  }
  //#endregion

  //#region Public methods
  public setFilters(filters: { [key: string ] : any }): void {
    this.filters = filters;

    if (this.hasFiltersApplied) {
      this.gridDataset.setFilters(filters);
    } else {
      this.gridDataset.setFilters();
    }

    this.filters = this.gridDataset.filters ?? {};
  }
  //#endregion

  //#region Private methods
  //#endregion
}
