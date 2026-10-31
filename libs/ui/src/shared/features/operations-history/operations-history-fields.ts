import { formatDate, formatNumber } from '@angular/common';
import { IOperationsHistoryField, IOperationsHistoryList, OperationsHistoryFieldType } from '../../models';

/** A value ready to show: either text as it is, or a translation key. */
export interface IOperationsHistoryValue {
  isKey: boolean;
  text: string;
}

const EMPTY_VALUE: IOperationsHistoryValue = { isKey: true, text: 'OperationsHistory-Value-Empty' };
const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

/**
 * Every field an operation shows.
 *
 * ZWebAPI 1.17 and later send the whole record, rebuilt from its history. An older backend sends
 * only what the operation wrote, as two JSON objects; those are read as the changed fields, with
 * their kind of value guessed from the value itself.
 *
 * @param operation The operation, or nothing.
 * @returns The fields, in the order the backend declares them.
 */
export function getOperationFields(operation: IOperationsHistoryList | null | undefined): IOperationsHistoryField[] {
  if (!operation) {
    return [];
  }

  if (operation.fields && operation.fields.length > 0) {
    return operation.fields;
  }

  const oldValues: Record<string, unknown> = parseValues(operation.oldValues);
  const newValues: Record<string, unknown> = parseValues(operation.newValues);
  const names: string[] = [...new Set([...Object.keys(oldValues), ...Object.keys(newValues)])];

  return names.map((name: string): IOperationsHistoryField => ({
    isChanged: true,
    isSystem: false,
    name,
    newValue: name in newValues ? newValues[name] : null,
    oldValue: name in oldValues ? oldValues[name] : null,
    type: guessType(name in newValues ? newValues[name] : oldValues[name]),
  }));
}

/**
 * How many data fields an operation changed, leaving bookkeeping out.
 *
 * @param operation The operation.
 * @returns The count.
 */
export function countChangedFields(operation: IOperationsHistoryList | null | undefined): number {
  return getOperationFields(operation).filter((field: IOperationsHistoryField) => field.isChanged && !field.isSystem)
    .length;
}

/**
 * Formats a field's value for the user.
 *
 * Dates follow the locale, with the time left out when it is midnight; numbers are grouped;
 * booleans and empty values become translation keys.
 *
 * @param value The value as the backend sent it.
 * @param type What kind of value the field holds.
 * @param locale The locale to format in.
 * @returns The text to show, or the key to translate.
 */
export function formatFieldValue(
  value: unknown,
  type: OperationsHistoryFieldType,
  locale: string,
): IOperationsHistoryValue {
  if (value === null || value === undefined || value === '') {
    return EMPTY_VALUE;
  }

  if (typeof value === 'boolean') {
    return { isKey: true, text: value ? 'OperationsHistory-Value-Yes' : 'OperationsHistory-Value-No' };
  }

  if (type === 'date' && (typeof value === 'string' || typeof value === 'number')) {
    const date: Date = new Date(value);
    if (!isNaN(date.getTime())) {
      const isMidnight: boolean = date.getHours() === 0 && date.getMinutes() === 0 && date.getSeconds() === 0;
      return { isKey: false, text: formatDate(date, isMidnight ? 'shortDate' : 'short', locale) };
    }
  }

  if (type === 'number' && typeof value === 'number') {
    return { isKey: false, text: formatNumber(value, locale, '1.0-6') };
  }

  if (typeof value === 'object') {
    return { isKey: false, text: JSON.stringify(value) };
  }

  return { isKey: false, text: String(value) };
}

function guessType(value: unknown): OperationsHistoryFieldType {
  switch (typeof value) {
    case 'boolean':
      return 'boolean';
    case 'number':
      return 'number';
    case 'string':
      return ISO_DATE.test(value) ? 'date' : 'text';
    default:
      return 'other';
  }
}

function parseValues(json: string | undefined): Record<string, unknown> {
  if (!json?.trim()) {
    return {};
  }

  try {
    const parsed: unknown = JSON.parse(json);
    return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)
      ? <Record<string, unknown>>parsed
      : {};
  } catch {
    return {};
  }
}
