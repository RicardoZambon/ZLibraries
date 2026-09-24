import { MultiSelectResultDataset } from './multi-select-result.dataset';

// Logic-only, built with Object.create: the dataset is abstract and none of this needs Angular.
describe('MultiSelectResultDataset', () => {
  let dataset: any;

  function setup(saved: { key: string; id: number }[] = []): void {
    dataset = Object.create(MultiSelectResultDataset.prototype);
    dataset._idsToAdd = [];
    dataset._idsToRemove = [];
    dataset.addedRowData = [];
    dataset.displayedIDs = [];
    dataset.displayedRows = [];
    dataset._loadedKeys = saved.map((row) => row.key);
    dataset.getRowID = (key: string) => saved.find((row) => row.key === key)?.id;
    dataset.getRowData = (key: string) => saved.find((row) => row.key === key);
  }

  //#region Idempotence
  describe('idempotence', () => {
    // Removing an entry reaches the dataset from two directions -- the panel says so directly, and
    // the grid says so again through its selection -- so the same report must not count twice.

    it('should record a removal once when it is reported twice', () => {
      setup([{ key: 'a', id: 1 }]);

      dataset.setIDToRemove(1);
      dataset.setIDToRemove(1);

      expect(dataset.idsToRemove).toEqual([1]);
    });

    it('should record an addition once when it is reported twice', () => {
      setup();

      dataset.setIDToAdd(7, { id: 7 });
      dataset.setIDToAdd(7, { id: 7 });

      expect(dataset.idsToAdd).toEqual([7]);
      expect(dataset.addedRowData).toHaveLength(1);
    });
    //#endregion
  });

  //#region Undoing
  describe('undoing', () => {
    it('should drop a pending addition rather than record a removal', () => {
      setup();
      dataset.setIDToAdd(7, { id: 7 });

      dataset.setIDToRemove(7);

      expect(dataset.idsToAdd).toEqual([]);
      expect(dataset.idsToRemove).toEqual([]);
    });

    it('should drop a pending removal rather than record an addition', () => {
      setup([{ key: 'a', id: 1 }]);
      dataset.setIDToRemove(1);

      dataset.setIDToAdd(1, { id: 1 });

      expect(dataset.idsToRemove).toEqual([]);
      expect(dataset.idsToAdd).toEqual([]);
    });

    it('should not record a removal for an entry it never held', () => {
      setup();

      dataset.setIDToRemove(99);

      expect(dataset.idsToRemove).toEqual([]);
    });
  });
  //#endregion

  //#region Displayed rows
  describe('displayed rows', () => {
    it('should hide a removed entry and show an added one', () => {
      setup([{ key: 'a', id: 1 }, { key: 'b', id: 2 }]);

      dataset.setIDToRemove(1);
      dataset.setIDToAdd(9, { id: 9 });

      expect(dataset.displayedIDs).toEqual([2, 9]);
    });
  });
  //#endregion
});
