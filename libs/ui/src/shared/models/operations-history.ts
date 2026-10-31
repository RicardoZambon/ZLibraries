import { InjectionToken } from '@angular/core';

/** What kind of value an audited field holds, as ZWebAPI reports it. */
export type OperationsHistoryFieldType = 'boolean' | 'date' | 'enum' | 'key' | 'number' | 'other' | 'text' | 'time';

/** One field of an audited record, before and after an operation. */
export interface IOperationsHistoryField {
  /** Whether the operation wrote this field. A creation writes every field, a deletion removes every one. */
  isChanged: boolean;
  /** Bookkeeping rather than data: the key, the audit columns, the concurrency token. */
  isSystem: boolean;
  /** The property name, as the backend declares it (`NomeCompleto`). */
  name: string;
  /** The value after the operation; `null` for a deletion, or when the backend could not rebuild it. */
  newValue?: unknown;
  /** The value before the operation; `null` for a creation, or when the backend could not rebuild it. */
  oldValue?: unknown;
  type: OperationsHistoryFieldType;
}

export interface IOperationsHistoryList {
  /** Capitalised `ID` is intentional: the backend property is `EntityID`, and the camelCase
   * serialization policy only lowercases a leading run of capitals — so the trailing ones survive. */
  entityID?: number;
  entityName?: string;
  /**
   * Every field of the record, before and after the operation. Sent by ZWebAPI 1.17 and later;
   * without it only the fields the operation wrote are known, from `oldValues` and `newValues`.
   */
  fields?: IOperationsHistoryField[];
  id: number;
  newValues?: string;
  oldValues?: string;
  operationType?: string;
  tableName?: string;
}

/**
 * Turns an audited field into the label the audit shows for it.
 *
 * The result goes through the translation pipe, so it may be a translation key. A key with no
 * translation shows as itself, which is why the default returns readable text rather than a key.
 */
export type OperationsHistoryFieldLabel = (fieldName: string, entityName: string | undefined) => string;

/**
 * Splits a PascalCase or camelCase property name into words, keeping acronyms whole.
 *
 * @param fieldName The property name.
 * @returns The name as words, with only the first capitalised.
 */
export function humanizeFieldName(fieldName: string): string {
  const words: string[] = fieldName.match(/[A-Z]{2,}(?=[A-Z][a-z]|\d|$)|[A-Z]?[a-z]+|[A-Z]+|\d+/g) ?? [fieldName];

  return words
    .map((word: string, index: number) => {
      if (word.length > 1 && word === word.toUpperCase()) {
        return word;
      }
      return index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word.toLowerCase();
    })
    .join(' ');
}

/**
 * Labels the fields of the audit's change details.
 *
 * The default splits the property name into words: `NomeCompleto` reads "Nome completo" and
 * `CadastroID` reads "Cadastro ID". Provide a function to use the application's own field labels:
 *
 * ```ts
 * { provide: OPERATIONS_HISTORY_FIELD_LABEL, useValue: (field, entity) => `${entity}-Field-${field}` }
 * ```
 */
export const OPERATIONS_HISTORY_FIELD_LABEL: InjectionToken<OperationsHistoryFieldLabel> =
  new InjectionToken<OperationsHistoryFieldLabel>('Audited field label', {
    providedIn: 'root',
    factory: () => humanizeFieldName,
  });
