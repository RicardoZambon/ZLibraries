import { TabViewService } from './tab-view.service';

describe('TabViewService', () => {
  let service: TabViewService;

  beforeEach(() => {
    service = new TabViewService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('activeView', () => {
    it('should return empty string by default', () => {
      expect(service.activeView).toBe('');
    });
  });

  describe('setActiveView', () => {
    it('should update activeView', () => {
      service.setActiveView('details');

      expect(service.activeView).toBe('details');
    });

    it('should emit on onViewChanged', () => {
      let emitted: string | undefined;
      service.onViewChanged.subscribe((v: string) => { emitted = v; });

      service.setActiveView('history');

      expect(emitted).toBe('history');
    });

    it('should not emit when same view is set again', () => {
      service.setActiveView('details');

      let emitted: boolean = false;
      service.onViewChanged.subscribe(() => { emitted = true; });

      service.setActiveView('details');

      expect(emitted).toBe(false);
    });

    it('should emit when changing to a different view', () => {
      service.setActiveView('details');

      let emitted: string | undefined;
      service.onViewChanged.subscribe((v: string) => { emitted = v; });

      service.setActiveView('history');

      expect(emitted).toBe('history');
    });
  });

  describe('updateRibbonTemplate', () => {
    it('should emit on onUpdateRibbonTemplate', () => {
      let emitted: any = 'not-set';
      service.onUpdateRibbonTemplate.subscribe((v: any) => { emitted = v; });

      service.updateRibbonTemplate(undefined);

      expect(emitted).toBeUndefined();
    });

    it('should replay the last value for new subscribers', () => {
      const mockTemplate: any = { elementRef: {} };
      service.updateRibbonTemplate(mockTemplate);

      let emitted: any = null;
      service.onUpdateRibbonTemplate.subscribe((v: any) => { emitted = v; });

      expect(emitted).toBe(mockTemplate);
    });
  });
});
