import { Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { OnPushRender, renderUnderOnPush } from '../../../testing';
import { FormService } from '../../services';
import { FormInputComponent } from './form-input.component';

/** How the host's form starts, read as the host is built so a spec picks the state of the first paint. */
let initialState: 'enabled' | 'disabled' | 'view-mode' = 'enabled';

/**
 * A field decides between an editable input and a read-only value from its form's state, and that
 * state changes long after the field first painted: a multi-editor enables its form when a row is
 * picked, and a view enables and disables its form as it enters and leaves edit mode. A FormGroup is
 * not a signal, so the field has to be told -- otherwise it keeps whichever face it painted first.
 *
 * Every change below is made after the first paint and reaches the field through nothing but the
 * form or the form service, which is exactly how those components drive it.
 */
@Component({
  imports: [FormInputComponent, ReactiveFormsModule],
  providers: [FormService],
  template: `
    <form [formGroup]="form">
      <lib-form-input controlName="name"></lib-form-input>
    </form>
  `,
})
class FormInputHostComponent {
  public readonly form: FormGroup = new FormGroup({
    name: new FormControl<string | null>('Ada'),
    surname: new FormControl<string | null>('Lovelace'),
  });
  public readonly formService: FormService = inject(FormService);

  constructor() {
    if (initialState === 'disabled') {
      this.form.disable();
    } else if (initialState === 'view-mode') {
      this.formService.initializeForm(this.form);
    }
  }
}

describe(`${FormInputComponent.name} under an OnPush ancestor`, () => {
  function input(render: OnPushRender<FormInputHostComponent>): HTMLInputElement | null {
    return render.element.querySelector<HTMLInputElement>('lib-form-input input');
  }

  function shownValue(render: OnPushRender<FormInputHostComponent>): string | undefined {
    return render.element.querySelector<HTMLElement>('lib-form-input .value')?.textContent?.trim();
  }

  async function renderHost(state: typeof initialState): Promise<OnPushRender<FormInputHostComponent>> {
    initialState = state;
    const render: OnPushRender<FormInputHostComponent> = renderUnderOnPush(FormInputHostComponent);
    await render.fixture.whenStable();
    return render;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('turns into an input when its form is enabled', async () => {
    const render: OnPushRender<FormInputHostComponent> = await renderHost('disabled');
    expect(input(render)).toBeNull();

    render.component.form.enable();
    await render.fixture.whenStable();

    expect(input(render)).not.toBeNull();
  });

  it('goes back to showing the value when its form is disabled', async () => {
    const render: OnPushRender<FormInputHostComponent> = await renderHost('enabled');
    expect(input(render)).not.toBeNull();

    render.component.form.disable();
    await render.fixture.whenStable();

    expect(input(render)).toBeNull();
    expect(shownValue(render)).toBe('Ada');
  });

  it('shows a value patched in while its form is disabled', async () => {
    const render: OnPushRender<FormInputHostComponent> = await renderHost('disabled');
    expect(shownValue(render)).toBe('Ada');

    render.component.form.patchValue({ name: 'Grace' });
    await render.fixture.whenStable();

    expect(shownValue(render)).toBe('Grace');
  });

  it('leaves edit mode when the view cancels the edit, for a control kept disabled while editing', async () => {
    // A field whose control is disabled throughout the edit -- a read-only username, say. Cancelling
    // disables the form, but this control's own status does not change, so nothing Angular tracks
    // for the input changes either. And the field read `form.enabled || isEditMode`: while the form
    // was enabled the second half was never evaluated, so the edit-mode signal went untracked too.
    const render: OnPushRender<FormInputHostComponent> = await renderHost('view-mode');
    expect(input(render)).toBeNull();

    render.component.formService.beginEdit();
    render.component.form.get('name')!.disable();
    await render.fixture.whenStable();
    expect(input(render)).not.toBeNull();

    render.component.formService.cancelEdit();
    await render.fixture.whenStable();

    expect(input(render)).toBeNull();
    expect(shownValue(render)).toBe('Ada');
  });
});
