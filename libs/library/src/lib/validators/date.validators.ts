import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class DateValidators {
  static lessThanToday(control: AbstractControl): ValidationErrors | null {
    let today: Date = new Date();
    if (!!control.value && new Date(control.value) >= today) {
      return { 'lessThanToday': true };
    }
    return null;
  }

  static lessThanControl(controlName: string) : ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const compareControl = control.parent?.get(controlName);
      if (!!control.value && !!compareControl?.value && new Date(control.value) >= new Date(compareControl?.value)) {
        return { 'lessThanControl': true };
      }
      return null;
    }
  }

  static lessThanOrEqualToday(control: AbstractControl): ValidationErrors | null {
    let today: Date = new Date();
    if (!!control.value && new Date(control.value) > today) {
      return { 'lessThanOrEqualToday': true };
    }
    return null;
  }

  static lessThanOrEqualControl(controlName: string) : ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const compareControl = control.parent?.get(controlName);
      if (!!control.value && !!compareControl?.value && new Date(control.value) > new Date(compareControl?.value)) {
        return { 'lessThanOrEqualControl': true };
      }
      return null;
    }
  }

  static greaterThanToday(control: AbstractControl): ValidationErrors | null {
    let today: Date = new Date();
    if (!!control.value && new Date(control.value) <= today) {
      return { 'greaterThanToday': true };
    }
    return null;
  }

  static greaterThanControl(controlName: string) : ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const compareControl = control.parent?.get(controlName);
      if (!!control.value && !!compareControl?.value && new Date(control.value) <= new Date(compareControl?.value)) {
        return { 'greaterThanControl': true };
      }
      return null;
    }
  }

  static greaterThanOrEqualToday(control: AbstractControl): ValidationErrors | null {
    let today: Date = new Date();
    if (!!control.value && new Date(control.value) < today) {
      return { 'greaterThanOrEqualToday': true };
    }
    return null;
  }

  static greaterThanOrEqualControl(controlName: string) : ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const compareControl = control.parent?.get(controlName);
      if (!!control.value && !!compareControl?.value && new Date(control.value) < new Date(compareControl?.value)) {
        return { 'greaterThanOrEqualControl': true };
      }
      return null;
    }
  }

  static minDate(minDate: Date): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!!control.value && new Date(control.value) < minDate) {
        return { 'minDate': true };
      }
      return null;
    }
  }

  static maxDate(maxDate: Date): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!!control.value && new Date(control.value) > maxDate) {
        return { 'maxDate': true };
      }
      return null;
    }
  }
}