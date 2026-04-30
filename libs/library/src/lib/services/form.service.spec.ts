import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup } from '@angular/forms';
import { FormService } from './form.service';

describe('FormService', () => {
  let service: FormService;

  beforeEach(() => {
    service = new FormService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initial state', () => {
    it('should start in view mode', () => {
      expect(service.isEditMode).toBe(false);
    });

    it('should not be loading', () => {
      expect(service.loading).toBe(false);
    });

    it('should have null model', () => {
      expect(service.model).toBeNull();
    });

    it('should report invalid when no form initialized', () => {
      expect(service.isValid).toBe(false);
    });
  });

  describe('beginEdit', () => {
    it('should switch to edit mode', () => {
      service.beginEdit();

      expect(service.isEditMode).toBe(true);
    });

    it('should enable the form', () => {
      const form: FormGroup = new FormGroup({ name: new FormControl('') });
      service.initializeForm(form);
      service.beginEdit();

      expect(form.enabled).toBe(true);
    });
  });

  describe('cancelEdit', () => {
    it('should switch back to view mode', () => {
      service.beginEdit();
      service.cancelEdit();

      expect(service.isEditMode).toBe(false);
    });

    it('should disable the form', () => {
      const form: FormGroup = new FormGroup({ name: new FormControl('') });
      service.initializeForm(form);
      service.beginEdit();
      service.cancelEdit();

      expect(form.disabled).toBe(true);
    });

    it('should emit editCanceled', () => {
      let canceled: boolean = false;
      service.editCanceled.subscribe(() => { canceled = true; });

      service.cancelEdit();

      expect(canceled).toBe(true);
    });

    it('should reset form to model value', () => {
      const form: FormGroup = new FormGroup({ name: new FormControl('') });
      service.initializeForm(form);
      service.model = { name: 'Original' };
      service.beginEdit();
      form.patchValue({ name: 'Changed' });

      service.cancelEdit();

      expect(form.getRawValue()).toEqual({ name: 'Original' });
    });
  });

  describe('initializeForm', () => {
    it('should disable the form in view mode', () => {
      const form: FormGroup = new FormGroup({ name: new FormControl('test') });

      service.initializeForm(form);

      expect(form.disabled).toBe(true);
    });

    it('should keep form enabled in edit mode', () => {
      const form: FormGroup = new FormGroup({ name: new FormControl('test') });
      service.beginEdit();

      service.initializeForm(form);

      expect(form.enabled).toBe(true);
    });

    it('should store initial value for reset', () => {
      const form: FormGroup = new FormGroup({ name: new FormControl('initial') });
      service.initializeForm(form);
      service.beginEdit();
      form.patchValue({ name: 'modified' });

      service.resetForm();

      expect(form.getRawValue()).toEqual({ name: 'initial' });
    });
  });

  describe('loading', () => {
    it('should disable form when loading starts', () => {
      const form: FormGroup = new FormGroup({ name: new FormControl('') });
      service.initializeForm(form);
      service.beginEdit();

      service.loading = true;

      expect(form.disabled).toBe(true);
    });

    it('should re-enable form when loading ends in edit mode', () => {
      const form: FormGroup = new FormGroup({ name: new FormControl('') });
      service.initializeForm(form);
      service.beginEdit();
      service.loading = true;

      service.loading = false;

      expect(form.enabled).toBe(true);
    });

    it('should not enable form when loading ends in view mode', () => {
      const form: FormGroup = new FormGroup({ name: new FormControl('') });
      service.initializeForm(form);
      service.loading = true;

      service.loading = false;

      expect(form.disabled).toBe(true);
    });

    it('should not toggle form state when value does not change', () => {
      const form: FormGroup = new FormGroup({ name: new FormControl('') });
      service.initializeForm(form);
      const enableSpy: jest.SpyInstance = jest.spyOn(form, 'enable');

      service.loading = false;

      expect(enableSpy).not.toHaveBeenCalled();
    });
  });

  describe('model', () => {
    it('should emit modelRefreshed when model changes', () => {
      let emittedValue: any = undefined;
      service.modelRefreshed.subscribe((v: any) => { emittedValue = v; });

      service.model = { id: 1 };

      expect(emittedValue).toEqual({ id: 1 });
    });

    it('should not emit when set to same reference', () => {
      const obj: any = { id: 1 };
      service.model = obj;

      let emitted: boolean = false;
      service.modelRefreshed.subscribe(() => { emitted = true; });

      service.model = obj;

      expect(emitted).toBe(false);
    });
  });

  describe('isValid', () => {
    it('should return true when form is valid and enabled', () => {
      const form: FormGroup = new FormGroup({ name: new FormControl('value') });
      service.beginEdit();
      service.initializeForm(form);

      expect(service.isValid).toBe(true);
    });

    it('should return false when form is disabled (view mode)', () => {
      const form: FormGroup = new FormGroup({ name: new FormControl('value') });
      service.initializeForm(form);

      expect(service.isValid).toBe(false);
    });
  });

  describe('markAllAsTouched', () => {
    it('should mark all controls as touched', () => {
      const form: FormGroup = new FormGroup({ name: new FormControl('') });
      service.initializeForm(form);

      service.markAllAsTouched();

      expect(form.get('name')!.touched).toBe(true);
    });

    it('should not throw when no form is initialized', () => {
      expect(() => service.markAllAsTouched()).not.toThrow();
    });
  });

  describe('getModelFromForm', () => {
    it('should return raw form value', () => {
      const form: FormGroup = new FormGroup({ name: new FormControl('test') });
      service.initializeForm(form);

      expect(service.getModelFromForm()).toEqual({ name: 'test' });
    });
  });

  describe('resetForm', () => {
    it('should reset to model value when model is set', () => {
      const form: FormGroup = new FormGroup({ name: new FormControl('') });
      service.initializeForm(form);
      service.model = { name: 'Model Value' };
      service.beginEdit();
      form.patchValue({ name: 'Changed' });

      service.resetForm();

      expect(form.getRawValue()).toEqual({ name: 'Model Value' });
    });

    it('should reset to initial value when no model', () => {
      const form: FormGroup = new FormGroup({ name: new FormControl('initial') });
      service.initializeForm(form);
      service.beginEdit();
      form.patchValue({ name: 'Changed' });

      service.resetForm();

      expect(form.getRawValue()).toEqual({ name: 'initial' });
    });

    it('should not throw when no form is initialized', () => {
      expect(() => service.resetForm()).not.toThrow();
    });
  });

  describe('fieldRefreshed', () => {
    it('should emit from beginFieldLoading', () => {
      let emitted: any = null;
      service.fieldRefreshed.subscribe((v: any) => { emitted = v; });

      service.beginFieldLoading('name');

      expect(emitted).toEqual({ fieldName: 'name', loading: true });
    });

    it('should emit from setFieldValue', () => {
      let emitted: any = null;
      service.fieldRefreshed.subscribe((v: any) => { emitted = v; });

      service.setFieldValue('name', 'newVal');

      expect(emitted).toEqual({ fieldName: 'name', loading: false, value: 'newVal' });
    });
  });

  describe('setValidationErrorsFromHttpResponse', () => {
    it('should set errors on form controls for 400 response', () => {
      jest.useFakeTimers();
      const form: FormGroup = new FormGroup({
        name: new FormControl(''),
        email: new FormControl(''),
      });
      service.initializeForm(form);

      const errorResponse: HttpErrorResponse = new HttpErrorResponse({
        status: 400,
        error: {
          errors: {
            Name: ['Name is required'],
            Email: ['Invalid email'],
          },
        },
      });

      service.setValidationErrorsFromHttpResponse(errorResponse);
      jest.runAllTimers();

      expect(form.get('name')!.errors).toEqual({ 'Name is required': true });
      expect(form.get('email')!.errors).toEqual({ 'Invalid email': true });
      expect(form.get('name')!.touched).toBe(true);
      jest.useRealTimers();
    });

    it('should ignore non-400 responses', () => {
      jest.useFakeTimers();
      const form: FormGroup = new FormGroup({ name: new FormControl('') });
      service.initializeForm(form);

      const errorResponse: HttpErrorResponse = new HttpErrorResponse({
        status: 500,
        error: { message: 'Server error' },
      });

      service.setValidationErrorsFromHttpResponse(errorResponse);
      jest.runAllTimers();

      expect(form.get('name')!.errors).toBeNull();
      jest.useRealTimers();
    });

    it('should not throw when no form is initialized', () => {
      const errorResponse: HttpErrorResponse = new HttpErrorResponse({
        status: 400,
        error: { errors: { Name: ['required'] } },
      });

      expect(() => service.setValidationErrorsFromHttpResponse(errorResponse)).not.toThrow();
    });

    it('should not throw with null errorResponse', () => {
      expect(() => service.setValidationErrorsFromHttpResponse(null as any)).not.toThrow();
    });
  });

  describe('disableForm / enableForm', () => {
    it('should disable the form', () => {
      const form: FormGroup = new FormGroup({ name: new FormControl('') });
      service.initializeForm(form);
      service.beginEdit();

      service.disableForm();

      expect(form.disabled).toBe(true);
    });

    it('should enable the form only in edit mode', () => {
      const form: FormGroup = new FormGroup({ name: new FormControl('') });
      service.initializeForm(form);

      service.enableForm();

      expect(form.disabled).toBe(true);
    });

    it('should enable the form when in edit mode', () => {
      const form: FormGroup = new FormGroup({ name: new FormControl('') });
      service.initializeForm(form);
      service.beginEdit();
      service.disableForm();

      service.enableForm();

      expect(form.enabled).toBe(true);
    });
  });
});
