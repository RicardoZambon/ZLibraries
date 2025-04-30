import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup } from '@angular/forms';

export abstract class BackendFormValidationHelper {
  public static validateAllFormFields(httpErrorResponse: HttpErrorResponse, formGroup: FormGroup) {
    if (!httpErrorResponse || !formGroup) {
      return;
    }

    // Error 400 = Validation issues
    if (httpErrorResponse.status === 400 && httpErrorResponse.error && httpErrorResponse.error.errors) {
      const errors: { [id: string]: string[] } = <{ [id: string]: string[]; }>httpErrorResponse.error.errors;

      Object.keys(errors)
        .map((x: string) => { return { key: x, field: x.substring(0, 1).toLocaleLowerCase() + x.substring(1, x.length) }; })
        .forEach((err: { key: string; field: string }) => {
          setTimeout(() => {
            const field: FormControl = <FormControl>formGroup.get(err.field);
            field?.setErrors({ [errors[err.key][0]]: true });
            field?.markAsTouched();
          });
        });
    }
  }
}