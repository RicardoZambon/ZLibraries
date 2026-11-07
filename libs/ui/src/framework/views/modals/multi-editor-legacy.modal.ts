import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DataGridDataset, MultiEditorComponent, MultiEditorDataset } from '@zambon-dev/ui/library';
import { takeUntil } from 'rxjs';
import { ModalBase } from './modal-base';

// No strategy on purpose: Angular never inherits `changeDetection`, so one declared here would
// describe a class that is never instantiated, while every subclass compiles to whatever it
// declares -- which in v22 means OnPush. Correctness comes from the state below notifying
// Angular, never from this decorator. See docs/guides/reactivity.md.
/**
 * Base for a modal that wraps a `lib-multi-editor`, for editing several child records at once.
 * The parent record is passed in through `entityId`.
 *
 * @deprecated Use {@link MultiEditorModal} instead.
 */
@Component({ template: '' })
export abstract class MultiEditorLegacyModal extends ModalBase implements OnInit {
  protected _entityId?: number;

  /** The multi-editor in this modal's template. */
  @ViewChild(MultiEditorComponent) multiEditor!: MultiEditorComponent;

  /** ID of the parent record. Scopes the grid and the editor to it. */
  @Input() set entityId(value: number | undefined) {
    if (this._entityId !== value) {
      this._entityId = value;
      this.dataGridDataset.parentEntityId = value;
      this.multiEditorDataset.parentEntityId = value;
    }
  }

  /** Emits after the editor saves its changes. */
  @Output() savedChanges = new EventEmitter();

  /** The editor form built by `formSetup()`. */
  form!: FormGroup;

  constructor(
    protected dataGridDataset: DataGridDataset,
    protected multiEditorDataset: MultiEditorDataset,
    protected formBuilder: FormBuilder,
  ) {
    super();
  }

  ngOnInit(): void {
    this.form = this.formSetup();

    this.multiEditorDataset.savedChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.savedChanges.emit();
    });
  }

  /** Opens or closes the multi-editor. */
  toggle(): void {
    this.multiEditor.toggleModal();
  }

  /** Builds the form the editor uses for each record. */
  abstract formSetup(): FormGroup;
}
