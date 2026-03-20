import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup } from '@angular/forms';
import { BackendFormValidationHelper } from './backend-form-validation-helper';

describe('BackendFormValidationHelper', () => {
  describe('validateAllFormFields', () => {
    it('should set errors on matching form controls for 400 response', () => {
      jest.useFakeTimers();
      const form: FormGroup = new FormGroup({
        name: new FormControl(''),
        email: new FormControl(''),
      });

      const errorResponse: HttpErrorResponse = new HttpErrorResponse({
        status: 400,
        error: {
          errors: {
            Name: ['Name is required'],
            Email: ['Invalid email format'],
          },
        },
      });

      BackendFormValidationHelper.validateAllFormFields(errorResponse, form);
      jest.runAllTimers();

      expect(form.get('name')!.errors).toEqual({ 'Name is required': true });
      expect(form.get('name')!.touched).toBe(true);
      expect(form.get('email')!.errors).toEqual({ 'Invalid email format': true });
      expect(form.get('email')!.touched).toBe(true);
      jest.useRealTimers();
    });

    it('should match control names case-insensitively', () => {
      jest.useFakeTimers();
      const form: FormGroup = new FormGroup({
        userName: new FormControl(''),
      });

      const errorResponse: HttpErrorResponse = new HttpErrorResponse({
        status: 400,
        error: {
          errors: {
            USERNAME: ['Required'],
          },
        },
      });

      BackendFormValidationHelper.validateAllFormFields(errorResponse, form);
      jest.runAllTimers();

      expect(form.get('userName')!.errors).toEqual({ Required: true });
      jest.useRealTimers();
    });

    it('should ignore non-400 responses', () => {
      jest.useFakeTimers();
      const form: FormGroup = new FormGroup({ name: new FormControl('') });

      const errorResponse: HttpErrorResponse = new HttpErrorResponse({
        status: 500,
        error: { message: 'Server error' },
      });

      BackendFormValidationHelper.validateAllFormFields(errorResponse, form);
      jest.runAllTimers();

      expect(form.get('name')!.errors).toBeNull();
      jest.useRealTimers();
    });

    it('should not throw for null errorResponse', () => {
      const form: FormGroup = new FormGroup({ name: new FormControl('') });

      expect(() => BackendFormValidationHelper.validateAllFormFields(null as any, form)).not.toThrow();
    });

    it('should not throw for null formGroup', () => {
      const errorResponse: HttpErrorResponse = new HttpErrorResponse({
        status: 400,
        error: { errors: { Name: ['required'] } },
      });

      expect(() => BackendFormValidationHelper.validateAllFormFields(errorResponse, null as any)).not.toThrow();
    });

    it('should skip fields that do not exist in the form', () => {
      jest.useFakeTimers();
      const form: FormGroup = new FormGroup({
        name: new FormControl(''),
      });

      const errorResponse: HttpErrorResponse = new HttpErrorResponse({
        status: 400,
        error: {
          errors: {
            Name: ['Required'],
            NonExistent: ['Some error'],
          },
        },
      });

      BackendFormValidationHelper.validateAllFormFields(errorResponse, form);
      jest.runAllTimers();

      expect(form.get('name')!.errors).toEqual({ Required: true });
      jest.useRealTimers();
    });
  });
});
