import { FormControl, FormGroup } from '@angular/forms';
import { DateValidators } from './date.validators';

describe('DateValidators', () => {
  describe('lessThanToday', () => {
    it('should return null for date before today', () => {
      const control: FormControl = new FormControl('2020-01-01');

      expect(DateValidators.lessThanToday(control)).toBeNull();
    });

    it('should return error for date after today', () => {
      const control: FormControl = new FormControl('2099-01-01');

      expect(DateValidators.lessThanToday(control)).toEqual({ lessThanToday: true });
    });

    it('should return null for empty value', () => {
      const control: FormControl = new FormControl('');

      expect(DateValidators.lessThanToday(control)).toBeNull();
    });

    it('should return null for null value', () => {
      const control: FormControl = new FormControl(null);

      expect(DateValidators.lessThanToday(control)).toBeNull();
    });
  });

  describe('lessThanOrEqualToday', () => {
    it('should return null for date before today', () => {
      const control: FormControl = new FormControl('2020-01-01');

      expect(DateValidators.lessThanOrEqualToday(control)).toBeNull();
    });

    it('should return error for date far in the future', () => {
      const control: FormControl = new FormControl('2099-01-01');

      expect(DateValidators.lessThanOrEqualToday(control)).toEqual({ lessThanOrEqualToday: true });
    });
  });

  describe('greaterThanToday', () => {
    it('should return null for date after today', () => {
      const control: FormControl = new FormControl('2099-01-01');

      expect(DateValidators.greaterThanToday(control)).toBeNull();
    });

    it('should return error for date before today', () => {
      const control: FormControl = new FormControl('2020-01-01');

      expect(DateValidators.greaterThanToday(control)).toEqual({ greaterThanToday: true });
    });
  });

  describe('greaterThanOrEqualToday', () => {
    it('should return null for date far in the future', () => {
      const control: FormControl = new FormControl('2099-01-01');

      expect(DateValidators.greaterThanOrEqualToday(control)).toBeNull();
    });

    it('should return error for date in the past', () => {
      const control: FormControl = new FormControl('2020-01-01');

      expect(DateValidators.greaterThanOrEqualToday(control)).toEqual({ greaterThanOrEqualToday: true });
    });
  });

  describe('lessThanControl', () => {
    it('should return null when value is less than the compared control', () => {
      const form: FormGroup = new FormGroup({
        start: new FormControl('2020-01-01'),
        end: new FormControl('2020-06-01'),
      });

      const validator = DateValidators.lessThanControl('end');
      expect(validator(form.get('start')!)).toBeNull();
    });

    it('should return error when value is greater than the compared control', () => {
      const form: FormGroup = new FormGroup({
        start: new FormControl('2020-06-01'),
        end: new FormControl('2020-01-01'),
      });

      const validator = DateValidators.lessThanControl('end');
      expect(validator(form.get('start')!)).toEqual({ lessThanControl: true });
    });

    it('should return null when either value is empty', () => {
      const form: FormGroup = new FormGroup({
        start: new FormControl(''),
        end: new FormControl('2020-06-01'),
      });

      const validator = DateValidators.lessThanControl('end');
      expect(validator(form.get('start')!)).toBeNull();
    });

    it('should return null when compared control is empty', () => {
      const form: FormGroup = new FormGroup({
        start: new FormControl('2020-01-01'),
        end: new FormControl(''),
      });

      const validator = DateValidators.lessThanControl('end');
      expect(validator(form.get('start')!)).toBeNull();
    });
  });

  describe('lessThanOrEqualControl', () => {
    it('should return null when values are equal', () => {
      const form: FormGroup = new FormGroup({
        start: new FormControl('2020-06-01'),
        end: new FormControl('2020-06-01'),
      });

      const validator = DateValidators.lessThanOrEqualControl('end');
      expect(validator(form.get('start')!)).toBeNull();
    });

    it('should return error when value is greater', () => {
      const form: FormGroup = new FormGroup({
        start: new FormControl('2020-12-01'),
        end: new FormControl('2020-06-01'),
      });

      const validator = DateValidators.lessThanOrEqualControl('end');
      expect(validator(form.get('start')!)).toEqual({ lessThanOrEqualControl: true });
    });
  });

  describe('greaterThanControl', () => {
    it('should return null when value is greater than the compared control', () => {
      const form: FormGroup = new FormGroup({
        start: new FormControl('2020-01-01'),
        end: new FormControl('2020-06-01'),
      });

      const validator = DateValidators.greaterThanControl('start');
      expect(validator(form.get('end')!)).toBeNull();
    });

    it('should return error when value is less than the compared control', () => {
      const form: FormGroup = new FormGroup({
        start: new FormControl('2020-06-01'),
        end: new FormControl('2020-01-01'),
      });

      const validator = DateValidators.greaterThanControl('start');
      expect(validator(form.get('end')!)).toEqual({ greaterThanControl: true });
    });
  });

  describe('greaterThanOrEqualControl', () => {
    it('should return null when values are equal', () => {
      const form: FormGroup = new FormGroup({
        start: new FormControl('2020-06-01'),
        end: new FormControl('2020-06-01'),
      });

      const validator = DateValidators.greaterThanOrEqualControl('start');
      expect(validator(form.get('end')!)).toBeNull();
    });

    it('should return error when value is less', () => {
      const form: FormGroup = new FormGroup({
        start: new FormControl('2020-06-01'),
        end: new FormControl('2020-01-01'),
      });

      const validator = DateValidators.greaterThanOrEqualControl('start');
      expect(validator(form.get('end')!)).toEqual({ greaterThanOrEqualControl: true });
    });
  });

  describe('minDate', () => {
    it('should return null when date is after minDate', () => {
      const control: FormControl = new FormControl('2020-06-01');
      const validator = DateValidators.minDate(new Date('2020-01-01'));

      expect(validator(control)).toBeNull();
    });

    it('should return error when date is before minDate', () => {
      const control: FormControl = new FormControl('2019-06-01');
      const validator = DateValidators.minDate(new Date('2020-01-01'));

      expect(validator(control)).toEqual({ minDate: true });
    });

    it('should return null for empty value', () => {
      const control: FormControl = new FormControl('');
      const validator = DateValidators.minDate(new Date('2020-01-01'));

      expect(validator(control)).toBeNull();
    });
  });

  describe('maxDate', () => {
    it('should return null when date is before maxDate', () => {
      const control: FormControl = new FormControl('2020-01-01');
      const validator = DateValidators.maxDate(new Date('2020-06-01'));

      expect(validator(control)).toBeNull();
    });

    it('should return error when date is after maxDate', () => {
      const control: FormControl = new FormControl('2021-01-01');
      const validator = DateValidators.maxDate(new Date('2020-06-01'));

      expect(validator(control)).toEqual({ maxDate: true });
    });

    it('should return null for empty value', () => {
      const control: FormControl = new FormControl('');
      const validator = DateValidators.maxDate(new Date('2020-06-01'));

      expect(validator(control)).toBeNull();
    });
  });
});
