import { KeyValuePipe, NgFor, NgIf, NgStyle, NgTemplateOutlet } from '@angular/common';
import { Component, Input, OnInit, Optional, TemplateRef } from '@angular/core';
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
  imports: [
    FormInputComponent,
    KeyValuePipe,
    NgFor,
    NgIf,
    NgStyle,
    NgTemplateOutlet,
    TranslatePipe,
],
  host: {
    '[class.full-height]': 'isFullHeight'
  }
})
export class FormInputGroupComponent extends BaseComponent implements OnInit {
  //#region ViewChilds, Inputs, Outputs
  @Input() public autofocus: boolean = false;
  @Input() public alignContent: 'center' | 'end' | 'start' = 'center';
  @Input() public controlName!: string;
  @Input() public fixedValue?: any;
  @Input() public format?: string;
  @Input() public label!: string;
  @Input() public isDisabled: boolean = true;
  @Input() public isFullHeight: boolean = false;
  @Input() public maxLength?: number;
  @Input() public notes: string = '';
  @Input() public readOnly: boolean = false;
  @Input() public rows!: number;
  @Input() public showLabel: boolean = true;
  @Input() public step: number = 1;
  @Input() public template!: TemplateRef<any>;
  @Input() public type: string = 'text';
  @Input() public validations: { [id: string]: string; } = {};
  //#endregion

  //#region Host listeners
  //#endregion

  //#region Variables
  protected loadingField: boolean = false;
  //#endregion

  //#region Properties
  protected get formControl(): FormControl<any> | null {
    return this.controlName
      ? <FormControl>this.formGroup.get(this.controlName)
      : null;
  }

  protected get formGroup(): FormGroup {
    let formGroup: FormGroup = this.formGroupDirective.form;
    for (let group of this.parentGroups) {
      formGroup = <FormGroup>formGroup.get(group);
    }
    return formGroup;
  }

  protected get hasNotes(): boolean {
    return !!this.notes && this.notes.length > 0;
  }

  protected get parentGroups(): string[] {
    return this.formGroupName?.path ?? [];
  }
  //#endregion

  //#region Constructor and Angular life cycle methods
  constructor(
    protected formService: FormService,
    protected readonly formGroupDirective: FormGroupDirective,
    @Optional() protected readonly formGroupName: FormGroupName,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.formControl?.statusChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadingField = false;
      });

    this.formControl?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadingField = false;
      });

    this.formService.fieldRefreshed
      .pipe(
        takeUntil(this.destroy$),
        filter((field: { fieldName?: string, value?: any, loading?: boolean }) => field.fieldName === this.controlName),
      )
      .subscribe((field: { fieldName?: string, value?: any, loading?: boolean }) => {
        this.loadingField = field.loading ?? false;
      });
  }
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  protected hasValidation(errorKey: string): boolean {
    return Object.keys(this.validations).indexOf(errorKey) >= 0;
  }
  //#endregion

  //#region Private methods
  //#endregion
}