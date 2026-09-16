import { FormControl, FormGroup } from '@angular/forms';
import { DisplayControls } from './display-controls';

describe('DisplayControls', () => {
  let form: FormGroup;

  beforeEach(() => {
    form = new FormGroup({
      employeeID: new FormControl<number | null>(null),
      employeeName: new FormControl<string | null>(null),
    });
  });

  it('reports a control nobody marked as an ordinary one', () => {
    expect(DisplayControls.isDisplayControl(form.get('employeeName'))).toBe(false);
  });

  it('reports a marked control as a display control', () => {
    DisplayControls.markAsDisplayControl(form.get('employeeName'));

    expect(DisplayControls.isDisplayControl(form.get('employeeName'))).toBe(true);
  });

  it('marks the instance, not the name, so another form with the same name is untouched', () => {
    const other: FormGroup = new FormGroup({ employeeName: new FormControl<string | null>(null) });
    DisplayControls.markAsDisplayControl(form.get('employeeName'));

    expect(DisplayControls.isDisplayControl(other.get('employeeName'))).toBe(false);
  });

  it('leaves the control it was given alone', () => {
    const control: FormControl = <FormControl>form.get('employeeName');
    control.setValue('753 - ADEMILSON LOPES MAGALHAES');

    DisplayControls.markAsDisplayControl(control);

    expect(control.value).toBe('753 - ADEMILSON LOPES MAGALHAES');
  });

  it('tolerates an absent control at both ends', () => {
    expect(() => DisplayControls.markAsDisplayControl(form.get('missing'))).not.toThrow();
    expect(DisplayControls.isDisplayControl(form.get('missing'))).toBe(false);
    expect(DisplayControls.isDisplayControl(undefined)).toBe(false);
  });
});
