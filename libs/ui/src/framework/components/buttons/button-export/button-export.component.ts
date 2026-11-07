import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Component, forwardRef, inject, input, InputSignal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DataGridDataset, IListParameters, RibbonButtonComponent, RibbonGroupChild } from '@zambon-dev/ui/library';
import { take } from 'rxjs';
import { BaseButton } from '../base-button';

export type ExportFormat = 'xlsx' | 'pdf' | 'csv' | 'xml' | 'mhtml';

export const MaxExportRows = 50000;

/**
 * Ribbon button that exports the surrounding data grid, with its current filters, as Excel, PDF,
 * CSV, XML or MHTML and downloads the file. Disabled when the grid has more than
 * `MaxExportRows` rows.
 */
@Component({
  selector: 'framework-button-export',
  templateUrl: './button-export.component.html',
  imports: [RibbonButtonComponent],
  providers: [{ provide: RibbonGroupChild, useExisting: forwardRef(() => ButtonExportComponent) }],
})
export class ButtonExportComponent extends BaseButton {
  //#region ViewChilds, Inputs, Outputs
  /**
   * Index of the format in `options` that the main button exports. Defaults to `0` (Excel); `-1`
   * makes the main button only open the format dropdown.
   */
  public readonly defaultOption: InputSignal<number> = input(0);
  /** File name used when the server response does not name the file. Defaults to `export`. */
  public readonly fileBaseName: InputSignal<string> = input('export');
  //#endregion

  //#region Variables
  private dataGridDataset: DataGridDataset | null = inject(DataGridDataset, { optional: true });
  private translateService: TranslateService = inject(TranslateService);
  //#endregion

  //#region Properties
  protected override get isButtonDisabled(): boolean {
    return super.isButtonDisabled || this.isExceedingExportLimit;
  }

  protected get tooltip(): string {
    if (this.isExceedingExportLimit) {
      return this.translateService.instant('Button-Export-LimitExceeded', { max: MaxExportRows });
    }
    return '';
  }

  private get isExceedingExportLimit(): boolean {
    const totalRows: number | undefined = this.dataGridDataset?.totalRows;
    return totalRows !== undefined && totalRows > MaxExportRows;
  }
  //#endregion

  //#region Constructor and Angular life cycle methods
  constructor() {
    super();

    this.options.set([
      { id: 'xlsx', label: 'Button-Export-Excel', icon: 'fa-file-excel' },
      { id: 'pdf', label: 'Button-Export-PDF', icon: 'fa-file-pdf' },
      { id: 'csv', label: 'Button-Export-CSV', icon: 'fa-file-csv' },
      { id: 'xml', label: 'Button-Export-XML', icon: 'fa-file-code' },
      { id: 'mhtml', label: 'Button-Export-MHTML', icon: 'fa-file-archive' },
    ]);
  }
  //#endregion

  //#region Event handlers
  protected onButtonClicked(format?: string): void {
    if (!this.dataGridDataset) {
      return;
    }

    const resolvedFormat: ExportFormat = (format as ExportFormat) ?? 'xlsx';

    this.startLoading();

    const parameters: IListParameters = {
      endRow: 0,
      filters: this.dataGridDataset.filters,
      startRow: 0,
    };

    this.dataGridDataset
      .export(resolvedFormat, parameters)
      .pipe(take(1))
      .subscribe({
        next: (response: HttpResponse<Blob>) => {
          this.download(response);
          this.finishLoading('success');
        },
        error: (_: HttpErrorResponse) => {
          this.finishLoading('failure');
        },
      });
  }
  //#endregion

  //#region Private methods
  private download(response: HttpResponse<Blob>): void {
    if (!response.body) {
      return;
    }

    const contentDisposition: string = response.headers.get('Content-Disposition') ?? '';
    const match: RegExpExecArray | null = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(contentDisposition);
    const fileName: string = match ? decodeURIComponent(match[1]) : this.fileBaseName();

    const url: string = URL.createObjectURL(response.body);
    const anchor: HTMLAnchorElement = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  }
  //#endregion
}
