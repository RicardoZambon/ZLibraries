import { TestBed } from '@angular/core/testing';
import { Injectable } from '@angular/core';
import { BaseDataset } from './base.dataset';

@Injectable()
class ConcreteBaseDataset extends BaseDataset {}

describe('BaseDataset', () => {
  let dataset: ConcreteBaseDataset;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ConcreteBaseDataset],
    });

    dataset = TestBed.inject(ConcreteBaseDataset);
  });

  it('should be created', () => {
    expect(dataset).toBeTruthy();
  });

  it('should have null dataProvider when none is provided', () => {
    expect((dataset as any).dataProvider).toBeNull();
  });

  describe('parentEntityId', () => {
    it('should get and set parentEntityId', () => {
      dataset.parentEntityId = 123;

      expect(dataset.parentEntityId).toBe(123);
    });

    it('should start as undefined', () => {
      expect(dataset.parentEntityId).toBeUndefined();
    });
  });

  describe('ngOnDestroy', () => {
    it('should complete the destroy$ subject', () => {
      let completed: boolean = false;
      (dataset as any).destroy$.subscribe({ complete: () => { completed = true; } });

      dataset.ngOnDestroy();

      expect(completed).toBe(true);
    });

    it('should emit true on destroy$', () => {
      let emittedValue: boolean | undefined;
      (dataset as any).destroy$.subscribe((v: boolean) => { emittedValue = v; });

      dataset.ngOnDestroy();

      expect(emittedValue).toBe(true);
    });
  });
});
