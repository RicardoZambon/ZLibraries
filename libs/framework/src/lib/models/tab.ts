export interface ITab {
  clones: string[];
  isTitleLoading: boolean;
  queryParams?: { [key: string]: string };
  title?: string;
  url: string;
}

export class Tab implements ITab{
  private _title?: string | undefined;

  public clones: string[] = [];
  
  public isTitleLoading: boolean = true;

  public queryParams?: { [key: string]: string };
  
  public get title(): string | undefined {
    return this._title;
  }
  public set title(value: string | undefined) {
    if (this._title !== value) {
      this._title = value;
  
      if (!!value) {
        this.isTitleLoading = false;
      }
    }
  }

  public url: string = '';

  constructor(init?: Partial<Tab>) {
    Object.assign(this, init);
  }
}