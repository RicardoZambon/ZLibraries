import { CommonModule, formatDate } from '@angular/common';
import {
  Component,
  computed,
  inject,
  input,
  InputSignal,
  model,
  ModelSignal,
  OnInit,
  output,
  OutputEmitterRef,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
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
  host: {
    '[class.full-height]': 'isFullHeight()',
    // Clears a stray `type` attribute for the same reason as FormInputGroupComponent — see the
    // comment there. Applies when a consumer sets `type` on `lib-form-input` directly.
    '[attr.type]': 'null',
  },
})
export class FormInputComponent extends BaseComponent implements OnInit {
  //#region ViewChilds, Inputs, Outputs
  public readonly autofocus: InputSignal<boolean> = input(false);
  public readonly controlName: InputSignal<string> = input('');
  public readonly disabledControlName: InputSignal<string | undefined> = input<string>();
  public readonly displayReadOnlyAsDisabled: InputSignal<boolean> = input(true);
  public readonly invalid: InputSignal<boolean> = input(false);
  public readonly isDisabled: InputSignal<boolean> = input(true);
  public readonly isFullHeight: InputSignal<boolean> = input(false);
  public readonly maxLength: InputSignal<number | undefined> = input<number>();
  public readonly min: InputSignal<number | undefined> = input<number>();
  public readonly readOnly: InputSignal<boolean> = input(false);
  public readonly rows: InputSignal<number | undefined> = input<number>();
  public readonly step: InputSignal<number> = input(1);
  public readonly type: InputSignal<string> = input('text');

  // Both are written by this component as well as bound by a parent, so they are models rather
  // than inputs: `fixedValue` is two-way bound through ngModel, and `format` gets a default for
  // date types when the consumer supplies none.
  public readonly fixedValue: ModelSignal<any> = model<any>();
  public readonly format: ModelSignal<string | undefined> = model<string>();

  // Deliberately NOT named blur/change/input/focus. <lib-form-input> is a real DOM
  // element, so an output sharing a native event name fires the consumer's handler
  // twice for the bubbling events and shadows the native one for the rest.
  public readonly blurred: OutputEmitterRef<void> = output<void>();
  public readonly changed: OutputEmitterRef<any> = output<any>();
  public readonly fixedValueChanged: OutputEmitterRef<string> = output<string>();
  public readonly focused: OutputEmitterRef<void> = output<void>();
  public readonly inputChanged: OutputEmitterRef<void> = output<void>();
  //#endregion

  //#region Host listeners
  //#endregion

  //#region Variables
  protected readonly formGroupDirective: FormGroupDirective = inject(FormGroupDirective);
  protected readonly formGroupName: FormGroupName = inject(FormGroupName, { optional: true })!;
  protected readonly formService: FormService = inject(FormService);

  /**
   * Bumped on every event the form emits -- a status change, a value change, a reset.
   *
   * A FormGroup is not a signal, so the template could not track whether the form is enabled or
   * what a control holds. Angular's own `NgControlStatus` notified this view by accident, but only
   * while an input was on screen and only when that control's own status moved. So the field never
   * turned into an input when a multi-editor enabled its form, and a control kept disabled through
   * an edit stayed an input after the edit was cancelled.
   *
   * A change made with `emitEvent: false` emits nothing, and still reaches no one.
   */
  private readonly formChanged: WritableSignal<number> = signal(0);
  //#endregion

  //#region Properties
  /**
   * Whether the field is an input rather than a read-only value. Both halves are read every time:
   * with `||` the edit-mode signal went untracked whenever the form happened to be enabled.
   */
  protected readonly isEditable: Signal<boolean> = computed(() => {
    this.formChanged();
    const isFormEnabled: boolean = this.formGroupDirective.form?.enabled ?? false;
    const isEditMode: boolean = this.formService.isEditMode;
    return isFormEnabled || isEditMode;
  });

  /** What the read-only face shows: the fixed value, or else the control's current value. */
  protected readonly shownValue: Signal<any> = computed(() => {
    this.formChanged();
    return (
      this.fixedValue() ?? this.formGroupDirective.form?.get(this.disabledControlName() ?? this.controlName())?.value
    );
  });

  protected get formControl(): FormControl<any> | null {
    return this.controlName() ? <FormControl>this.formGroup.get(this.controlName()) : null;
  }

  protected get formControlName(): string {
    return [...this.parentGroups, this.controlName()].join('.');
  }

  protected get formGroup(): FormGroup {
    let formGroup: FormGroup = this.formGroupDirective.form;
    for (const group of this.parentGroups) {
      formGroup = <FormGroup>formGroup.get(group);
    }
    return formGroup;
  }

  protected get isFormControl(): boolean {
    return !!this.controlName() && this.controlName().length > 0;
  }

  protected get parentGroups(): string[] {
    return this.formGroupName?.path ?? [];
  }

  protected get stepAttributeValue(): number | null {
    if (this.type() === 'number') {
      return this.step();
    }
    return null;
  }

  protected get minAttributeValue(): number | null {
    if (this.type() === 'number') {
      return this.min() ?? null;
    }
    return null;
  }
  //#endregion

  //#region Constructor and Angular life cycle methods
  constructor() {
    super();
  }

  public ngOnInit(): void {
    this.formGroupDirective.form?.events
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.formChanged.update((count: number) => count + 1));

    switch (this.type()) {
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
        if (this.format() === undefined) {
          this.format.set('yyyy-MM-dd');
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
    this.fixedValue.set(newText);
    this.fixedValueChanged.emit(newText);
  }
  //#endregion

  //#region Public methods
  //#endregion

  //#region Private methods
  //#endregion
}
