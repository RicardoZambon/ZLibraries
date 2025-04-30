import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DataGridDataset, MultiEditorComponent, MultiEditorDataset } from '@library';
import { takeUntil } from 'rxjs';
import { ModalBase } from './modal-base';

@Component({ template: '' })
export abstract class MultiEditorLegacyModal extends ModalBase implements OnInit {
  protected _entityId?: number;

  @ViewChild(MultiEditorComponent) multiEditor!: MultiEditorComponent;

  @Input() set entityId(value: number | undefined) {
    if (this._entityId !== value) {
      this._entityId = value;
      this.dataGridDataset.parentEntityId = value;
      this.multiEditorDataset.parentEntityId = value;
    }
  }

  @Output() savedChanges = new EventEmitter();

  form!: FormGroup;


  constructor(
    protected dataGridDataset: DataGridDataset,
    protected multiEditorDataset: MultiEditorDataset,
    protected formBuilder: FormBuilder
  ) {
    super();
  }

  ngOnInit(): void {
    this.form = this.formSetup();

    this.multiEditorDataset.savedChanges
    .pipe(takeUntil(this.destroy$))
    .subscribe(() => {
      this.savedChanges.emit();
    });
  }


  toggle(): void {
    this.multiEditor.toggleModal();
  }

  abstract formSetup(): FormGroup;
}