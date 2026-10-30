import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { OnPushRender, renderUnderOnPush } from '../../../testing';
import { CatalogService, FormService } from '../../services';
import { CatalogSelectComponent } from '../catalog-select/catalog-select.component';
import { FormInputGroupComponent } from './form-input-group.component';

/** The message the hosts map the server's error key to. With no translations loaded, it is shown as is. */
const TAKEN_MESSAGE = 'Someone else already has this username.';
const REQUIRED_MESSAGE = 'The username is required.';

/**
 * A field's validation message depends on its control's errors and touched state, and both change
 * long after the field first painted: the server's answer to a save arrives on a timer, and a save
 * marks every field as touched. A FormControl is not a signal, so the field has to be told --
 * otherwise the input turns red and the message only appears once something else redraws the field.
 *
 * Every change below is made after the first paint and reaches the field through nothing but the
 * form or the form service, which is exactly how a view or a multi-editor drives it.
 */
@Component({
  imports: [FormInputGroupComponent, ReactiveFormsModule],
  providers: [FormService],
  template: `
    <form [formGroup]="form">
      <lib-form-input-group controlName="username" [validations]="validations"></lib-form-input-group>
    </form>
  `,
})
class FormInputGroupHostComponent {
  public readonly form: FormGroup = new FormGroup({
    username: new FormControl<string | null>(null, Validators.required),
  });
  public readonly formService: FormService = inject(FormService);
  public readonly validations: { [id: string]: string } = { required: REQUIRED_MESSAGE, taken: TAKEN_MESSAGE };

  constructor() {
    this.formService.initializeForm(this.form);
    this.formService.beginEdit();
  }
}

/** The same field as a catalog select, which draws its own input inside the group. */
@Component({
  imports: [CatalogSelectComponent, ReactiveFormsModule],
  providers: [FormService],
  template: `
    <form [formGroup]="form">
      <lib-catalog-select
        controlName="username"
        displayControlName="usernameDisplay"
        [validations]="validations"
      ></lib-catalog-select>
    </form>
  `,
})
class CatalogSelectHostComponent extends FormInputGroupHostComponent {}

describe(`${FormInputGroupComponent.name} under an OnPush ancestor`, () => {
  function messages(render: OnPushRender<unknown>): string[] {
    return Array.from(render.element.querySelectorAll<HTMLElement>('.validations span')).map(
      (span: HTMLElement) => span.textContent?.trim() ?? '',
    );
  }

  function isMessageShown(render: OnPushRender<unknown>): boolean {
    return render.element.querySelector('.validations')?.classList.contains('show') ?? false;
  }

  async function answerSaveWithTakenUsername(render: OnPushRender<FormInputGroupHostComponent>): Promise<void> {
    render.component.form.get('username')!.setValue('ada');
    await render.fixture.whenStable();

    render.component.formService.setValidationErrorsFromHttpResponse(
      new HttpErrorResponse({ status: 400, error: { errors: { Username: ['taken'] } } }),
    );
    // The service applies the errors on a timer.
    await new Promise((resolve: (value: unknown) => void) => setTimeout(resolve));
    await render.fixture.whenStable();
  }

  async function renderHost<T extends FormInputGroupHostComponent>(type: new () => T): Promise<OnPushRender<T>> {
    const render: OnPushRender<T> = renderUnderOnPush(type);
    await render.fixture.whenStable();
    return render;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        {
          provide: CatalogService,
          useValue: { search: jest.fn().mockReturnValue(of({ entries: [], shouldUseCriteria: false })) },
        },
      ],
    });
  });

  it('shows the message the server sends back for a field', async () => {
    const render: OnPushRender<FormInputGroupHostComponent> = await renderHost(FormInputGroupHostComponent);
    expect(messages(render)).toEqual([]);

    await answerSaveWithTakenUsername(render);

    expect(messages(render)).toEqual([TAKEN_MESSAGE]);
    expect(isMessageShown(render)).toBe(true);
  });

  it('drops the server message once the field is edited', async () => {
    const render: OnPushRender<FormInputGroupHostComponent> = await renderHost(FormInputGroupHostComponent);
    await answerSaveWithTakenUsername(render);
    expect(messages(render)).toEqual([TAKEN_MESSAGE]);

    render.component.form.get('username')!.setValue('grace');
    await render.fixture.whenStable();

    expect(messages(render)).toEqual([]);
    expect(isMessageShown(render)).toBe(false);
  });

  it('shows a required message once a save marks the form as touched', async () => {
    const render: OnPushRender<FormInputGroupHostComponent> = await renderHost(FormInputGroupHostComponent);
    expect(messages(render)).toEqual([]);

    render.component.formService.markAllAsTouched();
    await render.fixture.whenStable();

    expect(messages(render)).toEqual([REQUIRED_MESSAGE]);
    expect(isMessageShown(render)).toBe(true);
  });

  it('shows the server message and marks the input invalid for a catalog select', async () => {
    const render: OnPushRender<CatalogSelectHostComponent> = await renderHost(CatalogSelectHostComponent);
    expect(messages(render)).toEqual([]);

    await answerSaveWithTakenUsername(render);

    expect(messages(render)).toEqual([TAKEN_MESSAGE]);
    expect(render.element.querySelector('lib-catalog-select lib-form-input .invalid')).not.toBeNull();
  });
});
