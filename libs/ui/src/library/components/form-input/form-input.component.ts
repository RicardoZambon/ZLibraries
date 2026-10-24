import { CommonModule, formatDate } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output, ChangeDetectionStrategy } from '@angular/core';
import {
  ControlContainer,
  FormControl,
  FormGroup,
  FormGroupDirective,
  FormGroupName,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { takeUntil } from 'rxjs';
import { FormService } from '../../services';
import { BaseComponent } from '../base.component';

@Component({
  selector: 'lib-form-input',
  templateUrl: './form-input.component.html',
  styleUrls: ['./form-input.component.scss'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }],
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    '[class.full-height]': 'isFullHeight',
    // Clears a stray `type` attribute for the same reason as FormInputGroupComponent — see the
    // comment there. Applies when a consumer sets `type` on `lib-form-input` directly.
    '[attr.type]': 'null',
  },
})
export class FormInputComponent extends BaseComponent implements OnInit {
  //#region ViewChilds, Inputs, Outputs
  @Input() public autofocus = false;
  @Input() public controlName = '';
  @Input() public disabledControlName?: string;
  @Input() public displayReadOnlyAsDisabled = true;
  @Input() public fixedValue?: any;
  @Input() public format?: string;
  @Input() public invalid = false;
  @Input() public isDisabled = true;
  @Input() public isFullHeight = false;
  @Input() public maxLength?: number;
  @Input() public min?: number;
  @Input() public readOnly = false;
  @Input() public rows!: number;
  @Input() public step = 1;
  @Input() public type = 'text';

  // Deliberately NOT named blur/change/input/focus. <lib-form-input> is a real DOM
  // element, so an output sharing a native event name fires the consumer's handler
  // twice for the bubbling events and shadows the native one for the rest.
  @Output() public blurred: EventEmitter<void> = new EventEmitter<void>();
  @Output() public changed: EventEmitter<any> = new EventEmitter<any>();
  @Output() public fixedValueChanged: EventEmitter<string> = new EventEmitter<string>();
  @Output() public focused: EventEmitter<void> = new EventEmitter<void>();
  @Output() public inputChanged: EventEmitter<void> = new EventEmitter<void>();
  //#endregion

  //#region Host listeners
  //#endregion

  //#region Variables
  protected readonly formGroupDirective: FormGroupDirective = inject(FormGroupDirective);
  protected readonly formGroupName: FormGroupName = inject(FormGroupName, { optional: true })!;
  protected readonly formService: FormService = inject(FormService);
  //#endregion

  //#region Properties
  protected get formControl(): FormControl<any> | null {
    return this.controlName ? <FormControl>this.formGroup.get(this.controlName) : null;
  }

  protected get formControlName(): string {
    return [...this.parentGroups, this.controlName].join('.');
  }

  protected get formGroup(): FormGroup {
    let formGroup: FormGroup = this.formGroupDirective.form;
    for (const group of this.parentGroups) {
      formGroup = <FormGroup>formGroup.get(group);
    }
    return formGroup;
  }

  protected get isFormControl(): boolean {
    return !!this.controlName && this.controlName.length > 0;
  }

  protected get isFormEditMode(): boolean {
    return this.formService.isEditMode;
  }

  protected get parentGroups(): string[] {
    return this.formGroupName?.path ?? [];
  }

  protected get stepAttributeValue(): number | null {
    if (this.type === 'number') {
      return this.step;
    }
    return null;
  }

  protected get minAttributeValue(): number | null {
    if (this.type === 'number') {
      return this.min ?? null;
    }
    return null;
  }
  //#endregion

  //#region Constructor and Angular life cycle methods
  constructor() {
    super();
  }

  public ngOnInit(): void {
    switch (this.type) {
      case 'number':
        if (this.formControl) {
          this.formControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value: any) => {
            if (value !== null && value === '') {
              this.formControl?.setValue(null);
            }
          });
        }
        break;

      case 'date':
        if (this.format === undefined) {
          this.format = 'yyyy-MM-dd';
        }

        if (this.formControl) {
          this.formControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value: any) => {
            if (value !== null) {
              try {
                if (value !== formatDate(value, 'yyyy-MM-dd', 'en')) {
                  this.formControl?.setValue(formatDate(value, 'yyyy-MM-dd', 'en'), { emitEvent: false });
                }
              } catch {
                this.formControl?.setValue(null, { emitEvent: false });
              }
            }
          });
        }
        break;
    }
  }
  //#endregion

  //#region Event handlers
  protected onBlur(): void {
    this.blurred.emit();
  }

  protected onChange(value: any): void {
    this.changed.emit(value);
  }

  protected onFocus(): void {
    this.focused.emit();
  }

  protected onInput(): void {
    this.inputChanged.emit();
  }

  protected onValueChanged(newText: string): void {
    this.fixedValue = newText;
    this.fixedValueChanged.emit(this.fixedValue);
  }
  //#endregion

  //#region Public methods
  //#endregion

  //#region Private methods
  //#endregion
}
