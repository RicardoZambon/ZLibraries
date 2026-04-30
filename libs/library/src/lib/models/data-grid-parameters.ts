export interface IListParameters extends ISummaryParameters {
  endRow: number;
  sort?: { [key: string]: string };
  startRow: number;
}

export interface ISummaryParameters {
  filters?: { [key: string]: string };
}