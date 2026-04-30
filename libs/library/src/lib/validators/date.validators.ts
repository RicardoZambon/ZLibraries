import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class DateValidators {
  //#region Public methods
  public static greaterThanControl(controlName: string) : ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const compareControl: AbstractControl | null | undefined = control.parent?.get(controlName);
      if (!!control.value && !!compareControl?.value && new Date(control.value) <= new Date(compareControl?.value)) {
        return { 'greaterThanControl': true };
      }
      return null;
    }
  }

  public static greaterThanOrEqualControl(controlName: string) : ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const compareControl: AbstractControl | null | undefined = control.parent?.get(controlName);
      if (!!control.value && !!compareControl?.value && new Date(control.value) < new Date(compareControl?.value)) {
        return { 'greaterThanOrEqualControl': true };
      }
      return null;
    }
  }

  public static greaterThanOrEqualToday(control: AbstractControl): ValidationErrors | null {
    let today: Date = new Date();
    if (!!control.value && new Date(control.value) < today) {
      return { 'greaterThanOrEqualToday': true };
    }
    return null;
  }

  public static greaterThanToday(control: AbstractControl): ValidationErrors | null {
    let today: Date = new Date();
    if (!!control.value && new Date(control.value) <= today) {
      return { 'greaterThanToday': true };
    }
    return null;
  }

  public static lessThanControl(controlName: string) : ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const compareControl: AbstractControl | null | undefined = control.parent?.get(controlName);
      if (!!control.value && !!compareControl?.value && new Date(control.value) >= new Date(compareControl?.value)) {
        return { 'lessThanControl': true };
      }
      return null;
    }
  }

  public static lessThanOrEqualControl(controlName: string) : ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const compareControl: AbstractControl | null | undefined = control.parent?.get(controlName);
      if (!!control.value && !!compareControl?.value && new Date(control.value) > new Date(compareControl?.value)) {
        return { 'lessThanOrEqualControl': true };
      }
      return null;
    }
  }

  public static lessThanOrEqualToday(control: AbstractControl): ValidationErrors | null {
    let today: Date = new Date();
    if (!!control.value && new Date(control.value) > today) {
      return { 'lessThanOrEqualToday': true };
    }
    return null;
  }

  public static lessThanToday(control: AbstractControl): ValidationErrors | null {
    let today: Date = new Date();
    if (!!control.value && new Date(control.value) >= today) {
      return { 'lessThanToday': true };
    }
    return null;
  }

  public static maxDate(maxDate: Date): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!!control.value && new Date(control.value) > maxDate) {
        return { 'maxDate': true };
      }
      return null;
    }
  }

  public static minDate(minDate: Date): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!!control.value && new Date(control.value) < minDate) {
        return { 'minDate': true };
      }
      return null;
    }
  }
  //#endregion
}