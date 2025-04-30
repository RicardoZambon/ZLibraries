import { TemplateRef } from '@angular/core';

export interface IGridColumn {
  customClass?: string;
  field: string;
  headerName: string;
  size?: string;
  realSize?: number;
  template?: TemplateRef<any>;
}