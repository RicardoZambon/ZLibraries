import { Component, Input, OnDestroy, ViewChild } from '@angular/core';
import { IRibbonButtonOption, RibbonButtonComponent, RibbonGroupChild } from '@library';
import { Subject, take } from 'rxjs';
import { AuthService } from '../../services';

@Component({ template: '' })
export class BaseButton extends RibbonGroupChild implements OnDestroy {
  //#region ViewChilds, Inputs, Outputs
  @ViewChild(RibbonButtonComponent) protected button!: RibbonButtonComponent;
  
  @Input() public set allowedActions(value: string[]) {
    if (this._allowedActions !== value) {
      this._allowedActions = value;
      this.checkAccessIsAllowed();
    }
  }
  @Input() public disabled: boolean = false;
  @Input() public iconSize: 'small' | 'large' = 'large';
  @Input() public loading: boolean = false;
  @Input() public set options(value: IRibbonButtonOption[]) {
    if (this._options !== value) {
      this._options = value;
      this.checkAccessIsAllowedToOptions();
    }
  }
  //#endregion

  //#region Variables
  public visible: boolean = true;

  protected destroy$: Subject<boolean> = new Subject<boolean>();
  protected isAccessLoaded: boolean = false;

  private _allowedActions: string[] = new Array<string>;
  private _options: IRibbonButtonOption[] = [];
  //#endregion

  //#region Properties
  public get allowedActions(): string[] {
    return this._allowedActions;
  }

  protected get isButtonDisabled(): boolean {
    return this.disabled || !this.isAccessLoaded;
  }

  public get isVisible(): boolean {
    return this.visible;
  }

  public get options(): IRibbonButtonOption[] {
    return this._options;
  }
  //#endregion

  //#region Constructor and Angular life cycle methods
  constructor(protected authService: AuthService) {
    super();

    this.checkAccessIsAllowed();
  }

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  public startLoading(): void {
    this.button.startLoading();
  }

  public finishLoading(status: 'failure' | 'warning' | 'success'): void {
    this.button.finishLoading(status);
  }
  //#endregion

  //#region Private methods
  private checkAccessIsAllowed(): void {
    if (this.allowedActions.length === 0) {
      this.isAccessLoaded = true;
      this.visible = true;
      return;
    }

    this.authService.checkActionsAreAllowed(this.allowedActions)
      .pipe(take(1))
      .subscribe((result: boolean[]) => {
        this.isAccessLoaded = true;
        this.visible = result.some((isAllowed: boolean) => isAllowed === true);
      });
  }

  private checkAccessIsAllowedToOptions(): void {
    if (this.options.length === 0) {
      return;
    }

    const optionsToCheckActions: IRibbonButtonOption[] = this.options
      .filter((option: IRibbonButtonOption) => (option.allowedActions?.length ?? 0) > 0);

    if (optionsToCheckActions.length > 0) {
      optionsToCheckActions.forEach((option: IRibbonButtonOption, index: number) => {
        this.authService.checkActionsAreAllowed(option.allowedActions!)
          .pipe(take(1))
          .subscribe((result: boolean[]) => {
            option.isAccessAllowed = result.some((isAllowed: boolean) => isAllowed === true);
          });
      });
    }
  }
  //#endregion
}