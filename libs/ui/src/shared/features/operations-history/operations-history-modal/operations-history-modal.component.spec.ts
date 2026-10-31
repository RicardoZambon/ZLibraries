import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { IOperationsHistoryList, OPERATIONS_HISTORY_FIELD_LABEL } from '../../../models';
import { OperationsHistoryModalComponent } from './operations-history-modal.component';

const UPDATE: IOperationsHistoryList = {
  entityID: 3,
  entityName: 'Cadastros',
  fields: [
    { isChanged: false, isSystem: true, name: 'ID', newValue: 3, oldValue: 3, type: 'key' },
    { isChanged: true, isSystem: false, name: 'NomeCompleto', newValue: 'Beta', oldValue: 'Alpha', type: 'text' },
    { isChanged: false, isSystem: false, name: 'Ativo', newValue: true, oldValue: true, type: 'boolean' },
  ],
  id: 10,
  newValues: '{"NomeCompleto":"Beta"}',
  oldValues: '{"NomeCompleto":"Alpha"}',
  operationType: 'Modified',
};

describe(OperationsHistoryModalComponent.name, () => {
  let fixture: ComponentFixture<OperationsHistoryModalComponent>;
  let component: any;

  function create(): void {
    fixture = TestBed.createComponent(OperationsHistoryModalComponent);
    component = fixture.componentInstance;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OperationsHistoryModalComponent, TranslateModule.forRoot()],
    }).compileComponents();
  });

  it('should create', () => {
    create();

    expect(component).toBeTruthy();
  });

  it('should list only the changed data fields at first, labelled and formatted', () => {
    create();
    fixture.componentRef.setInput('operation', UPDATE);

    expect(component.dataRows()).toEqual([
      {
        isChanged: true,
        isSystem: false,
        label: 'Nome completo',
        name: 'NomeCompleto',
        newValue: { isKey: false, text: 'Beta' },
        oldValue: { isKey: false, text: 'Alpha' },
      },
    ]);
    expect(component.systemRows()).toEqual([]);
    expect(component.operationLabel()).toBe('OperationsHistory-Operation-Modified');
  });

  it('should list every field, bookkeeping apart, when asked', () => {
    create();
    fixture.componentRef.setInput('operation', UPDATE);

    component.showAllFields.set(true);

    expect(component.dataRows().map((row: any) => row.name)).toEqual(['NomeCompleto', 'Ativo']);
    expect(component.systemRows().map((row: any) => row.name)).toEqual(['ID']);
    expect(component.dataRows()[1].newValue).toEqual({ isKey: true, text: 'OperationsHistory-Value-Yes' });
  });

  it('should offer every field only when the backend sent the whole record', () => {
    create();
    fixture.componentRef.setInput('operation', { ...UPDATE, fields: undefined });

    expect(component.hasFullRecord()).toBe(false);
    expect(component.dataRows().map((row: any) => row.name)).toEqual(['NomeCompleto']);
  });

  it('should tell creations and deletions apart', () => {
    create();

    fixture.componentRef.setInput('operation', { ...UPDATE, operationType: 'Added' });
    expect(component.isAdded()).toBe(true);
    expect(component.isDeleted()).toBe(false);

    fixture.componentRef.setInput('operation', { ...UPDATE, operationType: 'Deleted' });
    expect(component.isAdded()).toBe(false);
    expect(component.isDeleted()).toBe(true);
  });

  it('should still read the deprecated value inputs when no operation is bound', () => {
    create();
    fixture.componentRef.setInput('oldValues', { NomeCompleto: 'Alpha' });
    fixture.componentRef.setInput('newValues', { NomeCompleto: 'Beta' });

    expect(component.dataRows().map((row: any) => row.newValue.text)).toEqual(['Beta']);
  });

  it('should label fields with the application’s own function', () => {
    TestBed.overrideProvider(OPERATIONS_HISTORY_FIELD_LABEL, {
      useValue: (field: string, entity: string | undefined) => `${entity}-Field-${field}`,
    });
    create();
    fixture.componentRef.setInput('operation', UPDATE);

    expect(component.dataRows()[0].label).toBe('Cadastros-Field-NomeCompleto');
  });

  it('should render the changes table without errors', () => {
    create();
    fixture.componentRef.setInput('operation', UPDATE);

    expect(() => fixture.detectChanges()).not.toThrow();
  });
});
