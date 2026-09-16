import { FormControl, FormGroup } from '@angular/forms';
import { DisplayControls } from '@zambon-dev/library';
import { ButtonFiltersComponent } from './button-filters.component';

describe(ButtonFiltersComponent.name, () => {
  let component: ButtonFiltersComponent;
  let form: FormGroup;
  let setFilters: jest.Mock;
  let toggleModal: jest.Mock;

  /** What the screen submits: the pair a catalog select works in, plus an ordinary filter. */
  const submitted: { [key: string]: unknown } = {
    employeeID: 125,
    employeeName: '753 - ADEMILSON LOPES MAGALHAES',
    status: '3',
  };

  function build(): void {
    component = Object.create(ButtonFiltersComponent.prototype);

    Object.assign(<Record<string, unknown>><unknown>component, {
      button: { startLoading: jest.fn() },
      filters: {},
      formGroup: { form },
      gridDataset: { setFilters },
      modal: { toggleModal },
    });
  }

  function openTheModal(): void {
    (<{ onFiltersButtonClicked(): void }><unknown>component).onFiltersButtonClicked();
  }

  beforeEach(() => {
    form = new FormGroup({
      employeeID: new FormControl<number | null>(null),
      employeeName: new FormControl<string | null>(null),
      status: new FormControl<string | null>(null),
    });

    // This is what lib-catalog-select does to the control it drives as its display.
    DisplayControls.markAsDisplayControl(form.get('employeeName'));

    setFilters = jest.fn();
    toggleModal = jest.fn();

    build();
  });

  it('keeps a catalog selection out of what the backend receives', () => {
    component.setFilters(submitted);

    expect(setFilters).toHaveBeenCalledWith({ employeeID: 125, status: '3' });
  });

  it('still keeps the label, so reopening the modal shows the selection with its text', () => {
    component.setFilters(submitted);

    openTheModal();

    // A catalog select backed by a search endpoint cannot recover this from the identifier alone,
    // so losing it here would leave the field showing a selection with nothing written in it.
    expect(form.get('employeeName')?.value).toBe('753 - ADEMILSON LOPES MAGALHAES');
    expect(form.get('employeeID')?.value).toBe(125);
  });

  it('leaves a form without any catalog select untouched', () => {
    form = new FormGroup({ status: new FormControl<string | null>(null) });
    build();

    component.setFilters({ status: '3' });

    expect(setFilters).toHaveBeenCalledWith({ status: '3' });
  });

  it('asks for no filtering at all when nothing was submitted', () => {
    component.setFilters({});

    expect(setFilters).toHaveBeenCalledWith();
  });
});
