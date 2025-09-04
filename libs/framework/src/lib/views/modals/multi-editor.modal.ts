import { Component, EventEmitter, inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DataGridDataset, DataProviderService, FormService, MultiEditorComponent, MultiEditorDataset } from '@library';
import { takeUntil } from 'rxjs';
import { ModalBase } from './modal-base';

@Component({ template: '' })
export abstract class MultiEditorModal<TEntityModel> extends ModalBase implements OnInit {
  //#region ViewChilds, Inputs, Outputs
  @ViewChild(MultiEditorComponent) protected multiEditor!: MultiEditorComponent;

  @Input() public overrideParentID?: number;

  @Output() public savedChanges: EventEmitter<any> = new EventEmitter();
  //#endregion

  //#region Variables
  protected dataForm!: FormGroup;
  protected dataGridDataset: DataGridDataset;
  protected dataProvider: DataProviderService<TEntityModel> | null;
  protected formBuilder: FormBuilder;
  protected formService: FormService;
  protected multiEditorDataset: MultiEditorDataset;
  protected selectionCount: number = 0;
  //#endregion

  //#region Properties
  //#endregion

  //#region Constructor and Angular life cycle methods
  constructor() {
    super();

    this.dataGridDataset = inject(DataGridDataset);
    this.dataProvider = inject(DataProviderService, { optional: true });
    this.formBuilder = inject(FormBuilder);
    this.formService = inject(FormService);
    this.multiEditorDataset = inject(MultiEditorDataset);
  }

  public ngOnInit(): void {
    this.dataForm = this.formSetup();
    this.formService.initializeForm(this.dataForm);

    this.multiEditorDataset.savedChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.savedChanges.emit();
      });

    this.updateParentID();
  }
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  public toggle(): void {
    if (!this.multiEditor.isShown) {
      this.updateParentID();
    }

    this.multiEditor.toggleModal();
  }
  //#endregion

  //#region Private methods
  protected abstract formSetup(): FormGroup;

  private updateParentID(): void {
    let parentID: number | undefined = this.dataProvider?.entityID;
    if (this.overrideParentID) {
      parentID = this.overrideParentID;
    }

    if (parentID) {
      this.dataGridDataset.parentEntityId = parentID;
      this.multiEditorDataset.parentEntityId = parentID;
    }
  }
  //#endregion
}