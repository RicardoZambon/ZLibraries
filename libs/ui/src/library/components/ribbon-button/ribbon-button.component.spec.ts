import { RibbonButtonComponent } from './ribbon-button.component';
import { IRibbonButtonOption } from '../../models/ribbon-button-option';

describe('RibbonButtonComponent', () => {
  let component: RibbonButtonComponent;
  let overlayRef: { attach: jest.Mock; detach: jest.Mock; dispose: jest.Mock };
  let createOverlay: jest.Mock;

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
    component.tooltip = '';
    component.action = { emit: jest.fn() } as any;
    (component as any).showDropdown = false;
    (component as any).clickedOutside = false;
    (component as any).status = null;

    // The options list is rendered through a CDK overlay so it is not cut off by an ancestor that
    // clips -- lib-data-grid does. Stubbed rather than instantiated: what these tests are about is
    // when the list opens and closes, not where the CDK decides to put it.
    overlayRef = { attach: jest.fn(), detach: jest.fn(), dispose: jest.fn() };
    createOverlay = jest.fn().mockReturnValue(overlayRef);

    (component as any).buttonContainer = { nativeElement: document.createElement('div') };
    (component as any).optionsDropdown = {};
    (component as any).overlay = {
      create: createOverlay,
      scrollStrategies: { reposition: jest.fn() },
    };
    (component as any).positionBuilder = {
      flexibleConnectedTo: jest.fn().mockReturnValue({ withPositions: jest.fn().mockReturnThis() }),
    };
    (component as any).viewContainerRef = {};
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

  describe('tooltip', () => {
    it('should expose an empty tooltip by default', () => {
      expect(component.tooltip).toBe('');
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

  /**
   * The list lives in an overlay attached to the document, not in this button's subtree, because
   * lib-data-grid is `overflow: hidden` and its buttons bar is its first child -- so the export
   * button's options were cut off by the grid they opened into. What matters here is that exactly
   * one overlay exists while the list is open and none once it is not: a leaked overlay is a menu
   * left floating over the page.
   */
  describe('the options overlay', () => {
    beforeEach(() => {
      component.options = [
        { id: 'opt-1', label: 'Option 1' },
        { id: 'opt-2', label: 'Option 2' },
      ];
    });

    it('creates one overlay when the list opens', () => {
      (component as any).onShowHideDropdown();

      expect(createOverlay).toHaveBeenCalledTimes(1);
      expect(overlayRef.attach).toHaveBeenCalledTimes(1);
      expect(overlayRef.dispose).not.toHaveBeenCalled();
    });

    it('disposes of it when the list closes', () => {
      (component as any).onShowHideDropdown();
      (component as any).onShowHideDropdown();

      expect(overlayRef.detach).toHaveBeenCalledTimes(1);
      expect(overlayRef.dispose).toHaveBeenCalledTimes(1);
      expect((component as any).showDropdown).toBe(false);
    });

    it('disposes of it when an option is chosen', () => {
      (component as any).onShowHideDropdown();
      (component as any).onOptionClicked(component.options[1]);

      expect(overlayRef.dispose).toHaveBeenCalledTimes(1);
      expect(component.action.emit).toHaveBeenCalledWith('opt-2');
    });

    it('disposes of it when the button is destroyed with the list open', () => {
      (component as any).onShowHideDropdown();
      component.ngOnDestroy();

      expect(overlayRef.dispose).toHaveBeenCalledTimes(1);
    });

    it('does not open a second overlay on top of the first', () => {
      (component as any).onShowHideDropdown();
      (component as any).openDropdown();

      expect(overlayRef.dispose).toHaveBeenCalledTimes(1);
      expect(createOverlay).toHaveBeenCalledTimes(2);
    });

    it('stays closed when there is no list to show', () => {
      (component as any).optionsDropdown = undefined;

      (component as any).onShowHideDropdown();

      expect(createOverlay).not.toHaveBeenCalled();
      expect((component as any).showDropdown).toBe(false);
    });
  });
});
