export interface IBatchUpdate<TEntity, TKey> {
  entitiesToDelete: Array<TKey>;
  entitiesToInsertOrUpdate: Array<TEntity>;
}