export interface IOperationsHistoryList {
  /** Capitalised `ID` is intentional: the backend property is `EntityID`, and the camelCase
   * serialization policy only lowercases a leading run of capitals — so the trailing ones survive. */
  entityID?: number;
  entityName?: string;
  id: number;
  newValues?: string;
  oldValues?: string;
  operationType?: string;
  tableName?: string;
}