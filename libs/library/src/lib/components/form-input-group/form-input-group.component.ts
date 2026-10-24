import { KeyValuePipe, NgStyle, NgTemplateOutlet } from '@angular/common';
import { Component, inject, input, InputSignal, OnInit, signal, TemplateRef, WritableSignal } from '@angular/core';
import { FormControl, FormGroup, FormGroupDirective, FormGroupName } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { filter, takeUntil } from 'rxjs';
import { FormService } from '../../services';
import { BaseComponent } from '../base.component';
import { FormInputComponent } from '../form-input/form-input.component';

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
  public readonly autofocus: InputSignal<boolean> = input(false);
  public readonly alignContent: InputSignal<'center' | 'end' | 'start'> = input<'center' | 'end' | 'start'>('center');
  public readonly controlName: InputSignal<string> = input.required<string>();
  public readonly fixedValue: InputSignal<any> = input<any>();
  public readonly format: InputSignal<string | undefined> = input<string>();
  public readonly label: InputSignal<string> = input('');
  public readonly isDisabled: InputSignal<boolean> = input(true);
  public readonly isFullHeight: InputSignal<boolean> = input(false);
  public readonly maxLength: InputSignal<number | undefined> = input<number>();
  public readonly min: InputSignal<number | undefined> = input<number>();
  public readonly notes: InputSignal<string> = input('');
  public readonly readOnly: InputSignal<boolean> = input(false);
  public readonly rows: InputSignal<number | undefined> = input<number>();
  public readonly showLabel: InputSignal<boolean> = input(true);
  public readonly step: InputSignal<number> = input(1);
  public readonly template: InputSignal<TemplateRef<any> | undefined> = input<TemplateRef<any>>();
  public readonly type: InputSignal<string> = input('text');
  public readonly validations: InputSignal<{ [id: string]: string }> = input<{ [id: string]: string }>({});
  //#endregion

  //#region Host listeners
  //#endregion

  //#region Variables
  protected readonly formGroupDirective: FormGroupDirective = inject(FormGroupDirective);
  protected readonly formGroupName: FormGroupName = inject(FormGroupName, { optional: true })!;
  protected formService: FormService = inject(FormService);
  protected readonly loadingField: WritableSignal<boolean> = signal(false);
  //#endregion

  //#region Properties
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
    this.formControl?.statusChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.loadingField.set(false);
    });

    this.formControl?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.loadingField.set(false);
    });

    this.formService.fieldRefreshed
      .pipe(
        takeUntil(this.destroy$),
        filter((field: { fieldName?: string; value?: any; loading?: boolean }) => field.fieldName === this.controlName()),
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
