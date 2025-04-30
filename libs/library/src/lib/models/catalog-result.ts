import { ICatalogEntry } from './catalog-entry';

export interface ICatalogResult {
  entries: ICatalogEntry[];
  shouldUseCriteria: boolean;
}