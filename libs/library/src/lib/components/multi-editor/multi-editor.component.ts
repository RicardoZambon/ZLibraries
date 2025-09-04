import { NgIf } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormGroup } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { take, takeUntil } from 'rxjs';
import { FormService } from '../../services';
import { DataGridDataset } from '../../services/datasets/data-grid.dataset';
import { MultiEditorDataset } from '../../services/datasets/multi-editor.dataset';
import { DataGridComponent } from '../data-grid/data-grid.component';
import { FormGroupComponent } from '../form-group/form-group.component';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'lib-multi-editor',
  templateUrl: './multi-editor.component.html',
  styleUrls: ['./multi-editor.component.scss'],
  imports: [
    DataGridComponent,
    ModalComponent,
    NgIf,
    FormGroupComponent,
    TranslatePipe,
  ]
})
export class MultiEditorComponent extends ModalComponent implements OnInit {  
  //#region ViewChilds, Inputs, Outputs
  @ViewChild(ModalComponent) private modal!: ModalComponent;

  @Input() public addButtonLabel: string = 'Add row';
  @Input() public formGroup!: FormGroup<any>;
  @Input() public removeButtonLabel: string = 'Remove row';
  @Input() public showAddButton: boolean = true;
  @Input() public showDeleteButton: boolean = true;
  //#endregion

  //#region Variables
  protected gridLoading: boolean = false;

  private selectedKey?: string;
  private selectedValue?: any;
  //#endregion

  //#region Properties
  protected get formLoading(): boolean {
    return this.formService.loading;
  }

  protected get hasSelectedKey(): boolean {
    return !!this.selectedKey;
  }
  //#endregion

  //#region Constructor and Angular life cycle methods
  constructor(
    private formService: FormService,
    private dataGridDataset: DataGridDataset,
    private multiEditorDataset: MultiEditorDataset,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.dataGridDataset.loadFinished
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.multiEditorDataset.clearChangedValues();

        this.gridLoading = false;
        this.selectedKey = undefined;
        this.selectedValue = undefined;
      });

    this.dataGridDataset.selectedRowsChanged
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.gridLoading || !this.dataGridDataset.hasLoadedRows || !this.dataGridDataset.hasSelectedRows) {
          return;
        }

        if (this.formGroup.disabled) {
          this.formGroup.enable();
        }
        
        const selectedRowKey: string = this.dataGridDataset.selectedRowKeys[0];
        if (!!this.selectedKey && this.formGroup.enabled && !this.formGroup.valid && this.selectedKey !== selectedRowKey) {
          // If the form is invalid, need to stay in the same selected row.
          this.dataGridDataset.selectRow(this.selectedKey);
          this.formGroup.markAllAsTouched();

        } else {
          this.selectedKey = selectedRowKey;
          this.selectedValue = this.dataGridDataset.getRowData(selectedRowKey);
          this.formService.model = this.selectedValue;

          this.formGroup.reset();
          this.formGroup.patchValue(this.selectedValue);
        }
      });

    this.formGroup.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((_: any) => {
        if (this.selectedKey && this.formGroup.dirty) {
          this.multiEditorDataset.updateValues(this.selectedKey, this.formGroup.getRawValue());
        }
      });

    // Start with an empty form and, since there is no selected row, disable the form.
    this.formGroup.disable({ emitEvent: false });
  }
  //#endregion

  //#region Event handlers
  protected onDeleteClick(): void {
    if (!this.selectedKey) {
      return;
    }

    this.multiEditorDataset.removeValue(this.selectedKey);

    this.selectedKey = undefined;
    this.formGroup.reset({ emitEvent: false });
    this.clearAllFormArrays(this.formGroup);

    this.formGroup.disable({ emitEvent: false });
  }

  protected onNewClick(): void {
    const fakeNewID: number = (Math.floor(Math.random() * (999999 - 100000)) + 100000) * -1;
    const newModel: any = this.multiEditorDataset.newData(fakeNewID);

    if (!!newModel) {
      this.multiEditorDataset.storeFakeIDGenerated(fakeNewID);
      
      this.dataGridDataset.addNewRow(newModel);

      const newKey: string = this.dataGridDataset.loadedKeys![this.dataGridDataset.loadedKeys!.length - 1];
      this.dataGridDataset.selectRow(newKey);
    }
  }

  protected onSaveClick(): void {
    if (this.selectedKey) {
      this.formGroup.markAllAsTouched();
    }

    if (!this.selectedKey || this.formGroup.valid) {
      this.modalProcessing = true;
      this.formGroup.disable();

      this.multiEditorDataset.saveChanges()
        .pipe(take(1))
        .subscribe({
          next: (_: any) => {
            this.modalProcessing = false;
            this.toggleModal();
          },
          error: (e: HttpErrorResponse) => {
            this.modalProcessing = false;
            this.formGroup.enable();

            if (e.status === 400 && e.error.errors) {
              this.dataGridDataset.selectRowID(e.error.entityKey);

              this.formService.setValidationErrorsFromHttpResponse(e);
            }
          }
        });
    }
  }
  //#endregion

  //#region Public methods
  public override closeModal(): void {
    this.modal.closeModal();
  }

  public override toggleModal(): void {
    this.modal.toggleModal();

    if (this.modal.isShown) {
      this.gridLoading = true;
      this.dataGridDataset.refresh();
      
      this.selectedKey = undefined;
      this.formGroup.reset({ emitEvent: false });
      this.clearAllFormArrays(this.formGroup);
      this.formGroup.disable({ emitEvent: false });
    }
  }
  //#endregion

  //#region Private methods
  private clearAllFormArrays(form: FormGroup): void {
    Object.keys(form.controls).forEach((key: string) => {
      const control: AbstractControl | null = form.get(key);
      if (control instanceof FormArray) {
        control.clear({ emitEvent: false });
      }
      
      // Check for nested FormArrays.
      if (control instanceof FormGroup) {
        this.clearAllFormArrays(control);
      }
    });
  }
  //#endregion
}