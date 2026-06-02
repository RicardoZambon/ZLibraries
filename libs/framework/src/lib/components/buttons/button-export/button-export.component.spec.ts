import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { ButtonExportComponent, MaxExportRows } from './button-export.component';

describe('ButtonExportComponent', () => {
  let component: any;
  let mockDataGridDataset: {
    export: jest.Mock;
    filters?: { [key: string]: string };
    totalRows?: number;
  };
  let mockTranslateService: { instant: jest.Mock };
  let mockButton: { startLoading: jest.Mock; finishLoading: jest.Mock };

  beforeEach(() => {
    mockDataGridDataset = {
      export: jest.fn(),
      filters: { status: 'active' },
      totalRows: 10,
    };
    mockTranslateService = {
      instant: jest.fn().mockReturnValue('Limit exceeded'),
    };
    mockButton = {
      finishLoading: jest.fn(),
      startLoading: jest.fn(),
    };

    component = Object.create(ButtonExportComponent.prototype);
    component.disabled = false;
    component.visible = true;
    component.isAccessLoaded = true;
    component.fileBaseName = 'report';
    component.dataGridDataset = mockDataGridDataset;
    component.translateService = mockTranslateService;
    component.button = mockButton;
    component.options = [
      { id: 'xlsx', label: 'Button-Export-Excel', icon: 'fa-file-excel' },
      { id: 'pdf', label: 'Button-Export-PDF', icon: 'fa-file-pdf' },
      { id: 'csv', label: 'Button-Export-CSV', icon: 'fa-file-csv' },
      { id: 'xml', label: 'Button-Export-XML', icon: 'fa-file-code' },
      { id: 'mhtml', label: 'Button-Export-MHTML', icon: 'fa-file-archive' },
    ];

    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: jest.fn().mockReturnValue('blob:report'),
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: jest.fn(),
    });
    jest.spyOn(document, 'createElement').mockReturnValue({ click: jest.fn() } as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should configure the expected export format options', () => {
    expect(component.options.map((option: any) => option.id)).toEqual([
      'xlsx',
      'pdf',
      'csv',
      'xml',
      'mhtml',
    ]);
  });

  it('should disable the button and return a translated tooltip when the row limit is exceeded', () => {
    mockDataGridDataset.totalRows = MaxExportRows + 1;

    expect(component.isButtonDisabled).toBe(true);
    expect(component.tooltip).toBe('Limit exceeded');
    expect(mockTranslateService.instant).toHaveBeenCalledWith('Button-Export-LimitExceeded', { max: MaxExportRows });
  });

  it('should export the selected format with current filters and download the response', () => {
    const response = new HttpResponse({
      body: new Blob(['content']),
      headers: new HttpHeaders({
        'Content-Disposition': 'attachment; filename="export.xlsx"',
      }),
    });
    mockDataGridDataset.export.mockReturnValue(of(response));

    component.onButtonClicked('xlsx');

    expect(mockButton.startLoading).toHaveBeenCalledTimes(1);
    expect(mockDataGridDataset.export).toHaveBeenCalledWith('xlsx', {
      endRow: 0,
      filters: { status: 'active' },
      startRow: 0,
    });
    expect(mockButton.finishLoading).toHaveBeenCalledWith('success');
  });

  it('should finish loading as failure when export fails', () => {
    mockDataGridDataset.export.mockReturnValue(throwError(() => new Error('failed')));

    component.onButtonClicked('pdf');

    expect(mockButton.finishLoading).toHaveBeenCalledWith('failure');
  });
});
