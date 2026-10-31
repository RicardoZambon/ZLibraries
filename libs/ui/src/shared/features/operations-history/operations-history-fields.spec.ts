import { humanizeFieldName, IOperationsHistoryList } from '../../models';
import { countChangedFields, formatFieldValue, getOperationFields } from './operations-history-fields';

describe('operations history fields', () => {
  describe('getOperationFields', () => {
    it('should return the fields the backend rebuilt', () => {
      const operation: IOperationsHistoryList = {
        fields: [{ isChanged: true, isSystem: false, name: 'Name', newValue: 'B', oldValue: 'A', type: 'text' }],
        id: 1,
        newValues: '{"Name":"B"}',
        oldValues: '{"Name":"A"}',
      };

      expect(getOperationFields(operation)).toBe(operation.fields);
    });

    it('should read an older backend’s values as the changed fields', () => {
      const operation: IOperationsHistoryList = {
        id: 1,
        newValues: '{"Name":"B","IsActive":false}',
        oldValues: '{"Name":"A","IsActive":true,"On":"2024-01-01T10:30:00"}',
      };

      expect(getOperationFields(operation)).toEqual([
        { isChanged: true, isSystem: false, name: 'Name', newValue: 'B', oldValue: 'A', type: 'text' },
        { isChanged: true, isSystem: false, name: 'IsActive', newValue: false, oldValue: true, type: 'boolean' },
        { isChanged: true, isSystem: false, name: 'On', newValue: null, oldValue: '2024-01-01T10:30:00', type: 'date' },
      ]);
    });

    it('should read missing or malformed values as no fields', () => {
      expect(getOperationFields(null)).toEqual([]);
      expect(getOperationFields({ id: 1 })).toEqual([]);
      expect(getOperationFields({ id: 1, newValues: 'not json', oldValues: '[1]' })).toEqual([]);
    });
  });

  describe('countChangedFields', () => {
    it('should count the changed data fields and leave bookkeeping out', () => {
      const operation: IOperationsHistoryList = {
        fields: [
          { isChanged: true, isSystem: false, name: 'Name', type: 'text' },
          { isChanged: false, isSystem: false, name: 'Age', type: 'number' },
          { isChanged: true, isSystem: true, name: 'LastChangedByID', type: 'key' },
        ],
        id: 1,
      };

      expect(countChangedFields(operation)).toBe(1);
    });
  });

  describe('formatFieldValue', () => {
    it('should turn an empty value and a boolean into translation keys', () => {
      expect(formatFieldValue(null, 'text', 'en-US')).toEqual({ isKey: true, text: 'OperationsHistory-Value-Empty' });
      expect(formatFieldValue('', 'text', 'en-US')).toEqual({ isKey: true, text: 'OperationsHistory-Value-Empty' });
      expect(formatFieldValue(true, 'boolean', 'en-US')).toEqual({ isKey: true, text: 'OperationsHistory-Value-Yes' });
      expect(formatFieldValue(false, 'boolean', 'en-US')).toEqual({ isKey: true, text: 'OperationsHistory-Value-No' });
    });

    it('should format a date in the locale, leaving midnight out', () => {
      expect(formatFieldValue('2024-03-05T00:00:00', 'date', 'en-US').text).toBe('3/5/24');
      // Newer ICU data puts a narrow no-break space before the day period.
      expect(formatFieldValue('2024-03-05T14:30:00', 'date', 'en-US').text).toMatch(/^3\/5\/24, 2:30\s?PM$/u);
    });

    it('should group a number and keep its decimals', () => {
      expect(formatFieldValue(1234.5, 'number', 'en-US').text).toBe('1,234.5');
    });

    it('should show keys, texts and structured values as they are', () => {
      expect(formatFieldValue(12, 'key', 'en-US')).toEqual({ isKey: false, text: '12' });
      expect(formatFieldValue('Alpha', 'text', 'en-US')).toEqual({ isKey: false, text: 'Alpha' });
      expect(formatFieldValue({ a: 1 }, 'other', 'en-US')).toEqual({ isKey: false, text: '{"a":1}' });
    });
  });

  describe('humanizeFieldName', () => {
    it.each([
      ['NomeCompleto', 'Nome completo'],
      ['CadastroID', 'Cadastro ID'],
      ['cpf', 'Cpf'],
      ['RG', 'RG'],
      ['Email1', 'Email 1'],
      ['HTMLContent', 'HTML content'],
    ])('should read %s as "%s"', (name: string, label: string) => {
      expect(humanizeFieldName(name)).toBe(label);
    });
  });
});
