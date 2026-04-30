import { HttpErrorResponse } from '@angular/common/http';
import { FormGroup } from '@angular/forms';

export abstract class BackendFormValidationHelper {
  public static validateAllFormFields(httpErrorResponse: HttpErrorResponse, formGroup: FormGroup) {
    if (!httpErrorResponse || !formGroup) {
      return;
    }

    // Error 400 = Validation issues
    if (httpErrorResponse.status === 400 && httpErrorResponse.error && httpErrorResponse.error.errors) {
      const controls: string[] = Object.keys(formGroup.controls);
      const validationErrors: { [id: string]: string[] } = <{ [id: string]: string[]; }>httpErrorResponse.error.errors;

      Object.keys(validationErrors)
        .forEach((fieldName: string) => {
          setTimeout(() => {
            const controlName: string | undefined = controls.find((controlName: string) => controlName.toLocaleLowerCase() === fieldName.toLocaleLowerCase());
            if (!controlName || !formGroup.get(controlName)) {
              return;
            }

            formGroup.get(controlName)!.setErrors({ [validationErrors[fieldName][0]]: true });
            formGroup.get(controlName)!.markAsTouched();
          });
        });
    }
  }
}