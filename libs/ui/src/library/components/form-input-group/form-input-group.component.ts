import { KeyValuePipe, NgStyle, NgTemplateOutlet } from '@angular/common';
import {
  Component,
  computed,
  inject,
  input,
  InputSignal,
  OnInit,
  Signal,
  signal,
  TemplateRef,
  WritableSignal,
} from '@angular/core';
import { FormControl, FormGroup, FormGroupDirective, FormGroupName, ValidationErrors } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { filter, takeUntil } from 'rxjs';
import { FormService } from '../../services';
import { BaseComponent } from '../base.component';
import { FormInputComponent } from '../form-input/form-input.component';

/**
 * A labelled form field: a label, a `lib-form-input` (or your own template), its validation
 * messages and optional notes. It shows a placeholder while the field or the form is loading.
 */
@Component({
  selector: 'lib-form-input-group',
  templateUrl: './form-input-group.component.html',
  styleUrls: ['./form-input-group.component.scss'],
  imports: [FormInputComponent, KeyValuePipe, NgStyle, NgTemplateOutlet, TranslatePipe],
  host: {
    '[class.full-height]': 'isFullHeight()',
    // Angular keeps static attributes in the DOM even when a directive consumes them as an
    // @Input(), so `type="checkbox"` would linger on this host element — where
    // @tailwindcss/forms' tag-agnostic `[type="checkbox"]` base rules style the host itself as
    // a checkbox (1px border, white fill, height:1rem). Clearing the attribute removes the
    // stray box for every type while leaving the `type` @Input() untouched.
    '[attr.type]': 'null',
  },
})
export class FormInputGroupComponent extends BaseComponent implements OnInit {
  //#region ViewChilds, Inputs, Outputs
  /** Passed to the inner `lib-form-input`, which does not apply it yet. Defaults to `false`. */
  public readonly autofocus: InputSignal<boolean> = input(false);
  /** Vertical alignment of the field in its cell: `start`, `center` or `end`. Defaults to `center`. */
  public readonly alignContent: InputSignal<'center' | 'end' | 'start'> = input<'center' | 'end' | 'start'>('center');
  /** Name of the control in the surrounding form group. Its errors and loading state drive the messages. Required. */
  public readonly controlName: InputSignal<string> = input.required<string>();
  /** Value passed to the inner `lib-form-input` as its `fixedValue`. */
  public readonly fixedValue: InputSignal<any> = input<any>();
  /** Display format passed to the inner `lib-form-input`: a date pattern or a number digits string. */
  public readonly format: InputSignal<string | undefined> = input<string>();
  /** Text of the label, as a translation key. Defaults to empty. */
  public readonly label: InputSignal<string> = input('');
  /** Passed to the inner `lib-form-input`; disables it only when it shows a fixed value. Defaults to `true`. */
  public readonly isDisabled: InputSignal<boolean> = input(true);
  /** Lets the field grow to the full height of its container. Defaults to `false`. */
  public readonly isFullHeight: InputSignal<boolean> = input(false);
  /** Maximum number of characters for text inputs and textareas. No limit by default. */
  public readonly maxLength: InputSignal<number | undefined> = input<number>();
  /** Minimum value for a `number` field. No minimum by default. */
  public readonly min: InputSignal<number | undefined> = input<number>();
  /** Hint shown in small italics under the field, as a translation key. Defaults to empty. */
  public readonly notes: InputSignal<string> = input('');
  /** Makes the input read-only while it stays focusable. Defaults to `false`. */
  public readonly readOnly: InputSignal<boolean> = input(false);
  /** Visible number of lines for a `textarea` field. */
  public readonly rows: InputSignal<number | undefined> = input<number>();
  /** Shows the label column. When `false`, the field spans the full width. Defaults to `true`. */
  public readonly showLabel: InputSignal<boolean> = input(true);
  /** Increment for a `number` field. Defaults to `1`. */
  public readonly step: InputSignal<number> = input(1);
  /** Your own template to render in place of the default `lib-form-input`. */
  public readonly template: InputSignal<TemplateRef<any> | undefined> = input<TemplateRef<any>>();
  /** Kind of field, passed to the inner `lib-form-input`, for example `text`, `number`, `date`, `checkbox` or `textarea`. Defaults to `text`. */
  public readonly type: InputSignal<string> = input('text');
  /**
   * Messages per validation error key, as translation keys, for example
   * `{ required: 'Validation-Required' }`. Only errors listed here show a message, once the control is touched.
   */
  public readonly validations: InputSignal<{ [id: string]: string }> = input<{ [id: string]: string }>({});
  //#endregion

  //#region Host listeners
  //#endregion

  //#region Variables
  protected readonly formGroupDirective: FormGroupDirective = inject(FormGroupDirective);
  protected readonly formGroupName: FormGroupName = inject(FormGroupName, { optional: true })!;
  protected formService: FormService = inject(FormService);
  protected readonly loadingField: WritableSignal<boolean> = signal(false);

  /**
   * Bumped on every event the control emits -- a value, status or touched change.
   *
   * A FormControl is not a signal, so the template could not track the control's errors or whether
   * it was touched. A change the field made itself redrew it, but one made from outside did not: the
   * server's errors after a save turned the input red and left the message hidden until the user
   * typed again, and a save marking every field as touched showed no required message at all.
   */
  private readonly controlChanged: WritableSignal<number> = signal(0);
  //#endregion

  //#region Properties
  protected readonly errors: Signal<ValidationErrors | null> = computed(() => {
    this.controlChanged();
    return this.formControl?.errors ?? null;
  });

  protected readonly isInvalid: Signal<boolean> = computed(() => {
    this.controlChanged();
    return this.formControl?.invalid ?? false;
  });

  protected readonly isTouched: Signal<boolean> = computed(() => {
    this.controlChanged();
    return this.formControl?.touched ?? false;
  });

  protected get formControl(): FormControl<any> | null {
    return this.controlName() ? <FormControl>this.formGroup.get(this.controlName()) : null;
  }

  protected get formGroup(): FormGroup {
    let formGroup: FormGroup = this.formGroupDirective.form;
    for (const group of this.parentGroups) {
      formGroup = <FormGroup>formGroup.get(group);
    }
    return formGroup;
  }

  protected get hasNotes(): boolean {
    return !!this.notes() && this.notes().length > 0;
  }

  protected get parentGroups(): string[] {
    return this.formGroupName?.path ?? [];
  }
  //#endregion

  //#region Constructor and Angular life cycle methods
  constructor() {
    super();
  }

  public ngOnInit(): void {
    this.formControl?.events
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.controlChanged.update((count: number) => count + 1));

    this.formControl?.statusChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.loadingField.set(false);
    });

    this.formControl?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.loadingField.set(false);
    });

    this.formService.fieldRefreshed
      .pipe(
        takeUntil(this.destroy$),
        filter(
          (field: { fieldName?: string; value?: any; loading?: boolean }) => field.fieldName === this.controlName(),
        ),
      )
      .subscribe((field: { fieldName?: string; value?: any; loading?: boolean }) => {
        this.loadingField.set(field.loading ?? false);
      });
  }
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  protected hasValidation(errorKey: string): boolean {
    return Object.keys(this.validations()).indexOf(errorKey) >= 0;
  }
  //#endregion

  //#region Private methods
  //#endregion
}
