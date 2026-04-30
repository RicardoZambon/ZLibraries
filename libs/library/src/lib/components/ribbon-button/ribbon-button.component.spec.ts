import { RibbonButtonComponent } from './ribbon-button.component';
import { IRibbonButtonOption } from '../../models/ribbon-button-option';

describe('RibbonButtonComponent', () => {
  let component: RibbonButtonComponent;

  beforeEach(() => {
    component = Object.create(RibbonButtonComponent.prototype);
    component.color = 'text-primary-500';
    component.defaultOption = -1;
    component.disabled = false;
    component.icon = 'fa-save';
    component.iconSize = 'large';
    component.label = 'Test';
    component.loading = false;
    component.options = [];
    component.action = { emit: jest.fn() } as any;
    (component as any).showDropdown = false;
    (component as any).clickedOutside = false;
    (component as any).status = null;
  });

  describe('onButtonClicked', () => {
    it('should emit action with no value when there are no options', () => {
      (component as any).onButtonClicked();

      expect(component.action.emit).toHaveBeenCalledWith();
    });

    it('should toggle dropdown when there are options but no default option', () => {
      component.options = [
        { id: 'opt-1', label: 'Option 1' },
        { id: 'opt-2', label: 'Option 2' },
      ];

      (component as any).onButtonClicked();

      expect((component as any).showDropdown).toBe(true);
      expect(component.action.emit).not.toHaveBeenCalled();
    });

    it('should close dropdown and emit default option when defaultOption is set', () => {
      component.options = [
        { id: 'save', label: 'Save' },
        { id: 'save-and-close', label: 'Save & Close' },
      ];
      component.defaultOption = 0;
      (component as any).showDropdown = true;

      (component as any).onButtonClicked();

      expect((component as any).showDropdown).toBe(false);
      expect(component.action.emit).toHaveBeenCalledWith('save');
    });

    it('should close dropdown before emitting when default option is used (dropdown was open)', () => {
      component.options = [
        { id: 'save', label: 'Save' },
        { id: 'save-and-close', label: 'Save & Close' },
      ];
      component.defaultOption = 0;
      (component as any).showDropdown = true;

      let dropdownStateWhenEmitted: boolean | undefined;
      (component.action.emit as jest.Mock).mockImplementation(() => {
        dropdownStateWhenEmitted = (component as any).showDropdown;
      });

      (component as any).onButtonClicked();

      expect(dropdownStateWhenEmitted).toBe(false);
    });
  });

  describe('onOptionClicked', () => {
    it('should close dropdown and emit the selected option id', () => {
      (component as any).showDropdown = true;
      const option: IRibbonButtonOption = { id: 'save-and-new', label: 'Save & New' };

      (component as any).onOptionClicked(option);

      expect((component as any).showDropdown).toBe(false);
      expect(component.action.emit).toHaveBeenCalledWith('save-and-new');
    });
  });

  describe('onShowHideDropdown', () => {
    it('should toggle showDropdown from false to true', () => {
      (component as any).showDropdown = false;

      (component as any).onShowHideDropdown();

      expect((component as any).showDropdown).toBe(true);
    });

    it('should toggle showDropdown from true to false', () => {
      (component as any).showDropdown = true;

      (component as any).onShowHideDropdown();

      expect((component as any).showDropdown).toBe(false);
    });
  });

  describe('finishLoading', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should set loading to false and status to the given value', () => {
      component.loading = true;

      component.finishLoading('success');

      expect(component.loading).toBe(false);
      expect((component as any).status).toBe('success');
    });

    it('should reset status to null after 1 second', () => {
      component.finishLoading('warning');

      expect((component as any).status).toBe('warning');

      jest.advanceTimersByTime(1000);

      expect((component as any).status).toBeNull();
    });
  });

  describe('startLoading', () => {
    it('should set loading to true', () => {
      component.loading = false;

      component.startLoading();

      expect(component.loading).toBe(true);
    });
  });

  describe('buttonIcon', () => {
    it('should return success icon when status is success', () => {
      (component as any).status = 'success';
      expect((component as any).buttonIcon).toBe('fa-check');
    });

    it('should return failure icon when status is failure', () => {
      (component as any).status = 'failure';
      expect((component as any).buttonIcon).toBe('fa-times');
    });

    it('should return warning icon when status is warning', () => {
      (component as any).status = 'warning';
      expect((component as any).buttonIcon).toBe('fa-exclamation');
    });

    it('should return configured icon when no status', () => {
      (component as any).status = null;
      component.icon = 'fa-edit';
      expect((component as any).buttonIcon).toBe('fa-edit');
    });

    it('should return empty string when no status and no icon', () => {
      (component as any).status = null;
      component.icon = undefined;
      expect((component as any).buttonIcon).toBe('');
    });
  });

  describe('isButtonDisabled', () => {
    it('should be disabled when disabled input is true', () => {
      component.disabled = true;
      expect((component as any).isButtonDisabled).toBe(true);
    });

    it('should be disabled when loading is true', () => {
      component.loading = true;
      expect((component as any).isButtonDisabled).toBe(true);
    });

    it('should be disabled when all options are not visible', () => {
      component.options = [
        { id: 'opt-1', label: 'Option 1', isVisible: false },
        { id: 'opt-2', label: 'Option 2', isVisible: false },
      ];
      expect((component as any).isButtonDisabled).toBe(true);
    });

    it('should not be disabled when at least one option is visible', () => {
      component.options = [
        { id: 'opt-1', label: 'Option 1', isVisible: false },
        { id: 'opt-2', label: 'Option 2', isVisible: true },
      ];
      expect((component as any).isButtonDisabled).toBe(false);
    });
  });
});
