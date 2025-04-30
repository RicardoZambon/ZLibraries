export interface ITab {
  isTitleLoading: boolean;
  title?: string;
  url: string;
}

export class Tab implements ITab{
  private _title?: string | undefined;
  
  public isTitleLoading: boolean = true;
  
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