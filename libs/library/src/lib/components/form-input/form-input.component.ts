import { CommonModule, formatDate, NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Optional, Output } from '@angular/core';
import { ControlContainer, FormControl, FormGroup, FormGroupDirective, FormGroupName, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { takeUntil } from 'rxjs';
import { FormService } from '../../services';
import { BaseComponent } from '../base.component';

@Component({
  selector: 'lib-form-input',
  templateUrl: './form-input.component.html',
  styleUrls: ['./form-input.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    NgIf,
    NgSwitch,
    NgSwitchCase,
    ReactiveFormsModule,
  ],
  viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }],
  host: {
    '[class.full-height]': 'isFullHeight'
  }
})
export class FormInputComponent extends BaseComponent implements OnInit {
  //#region ViewChilds, Inputs, Outputs
  @Input() public autofocus: boolean = false;
  @Input() public controlName: string = '';
  @Input() public disabledControlName?: string;
  @Input() public displayReadOnlyAsDisabled: boolean = true;
  @Input() public fixedValue?: any;
  @Input() public format?: string;
  @Input() public invalid: boolean = false;
  @Input() public isDisabled: boolean = true;
  @Input() public isFullHeight: boolean = false;
  @Input() public maxLength?: number;
  @Input() public readOnly: boolean = false;
  @Input() public rows!: number;
  @Input() public step: number = 1;
  @Input() public type: string = 'text';
  
  @Output() public blur: EventEmitter<any> = new EventEmitter<any>();
  @Output() public change: EventEmitter<any> = new EventEmitter<any>();
  @Output() public fixedValueChanged: EventEmitter<any> = new EventEmitter<string>();
  @Output() public input: EventEmitter<any> = new EventEmitter<any>();
  @Output() public focus: EventEmitter<any> = new EventEmitter<any>();
  //#endregion

  //#region Host listeners
  //#endregion

  //#region Variables
  //#endregion

  //#region Properties
  protected get formControl(): FormControl<any> | null {
    return this.controlName
    ? <FormControl>this.formGroup.get(this.controlName)
    : null;
  }

  protected get formControlName(): string {
    return [
      ...this.parentGroups,
      this.controlName,
    ].join('.');
  }

  protected get formGroup(): FormGroup {
    let formGroup: FormGroup = this.formGroupDirective.form;
    for (let group of this.parentGroups) {
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
  //#endregion

  //#region Constructor and Angular life cycle methods
  constructor(
    protected readonly formGroupDirective: FormGroupDirective,
    @Optional() protected readonly formGroupName: FormGroupName,
    protected readonly formService: FormService,
  ) {
    super();
  }

  public ngOnInit(): void {
    switch (this.type) {
      case 'number':
        if (!!this.formControl) {
          this.formControl.valueChanges
            .pipe(takeUntil(this.destroy$))
            .subscribe((value: any) => {
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

        if (!!this.formControl) {
          this.formControl.valueChanges
            .pipe(takeUntil(this.destroy$))
            .subscribe((value: any) => {
              if (value !== null) {
                try {
                  if (value !== formatDate(value, 'yyyy-MM-dd', 'en')) {
                    this.formControl?.setValue(formatDate(value, 'yyyy-MM-dd', 'en'), { emitEvent: false });
                  }
                }
                catch {
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
    this.blur.emit();
  }

  protected onChange(value: any): void {
    this.change.emit(value);
  }

  protected onFocus(): void {
    this.focus.emit();
  }

  protected onInput(): void {
    this.input.emit();
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