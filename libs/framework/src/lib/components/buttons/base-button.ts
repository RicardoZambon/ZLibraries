import { Component, inject, Input, OnDestroy, Signal, signal, ViewChild, WritableSignal } from '@angular/core';
import { IRibbonButtonOption, RibbonButtonComponent, RibbonGroupChild } from '@zambon-dev/library';
import { Subject, take } from 'rxjs';
import { AuthService } from '../../services';

// No strategy on purpose: Angular never inherits `changeDetection`, so one declared here would
// describe a class that is never instantiated, while every subclass compiles to whatever it
// declares -- which in v22 means OnPush. Correctness comes from the state below notifying
// Angular, never from this decorator. See docs/guides/reactivity.md.
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
  @Input() public disabled = false;
  @Input() public iconSize: 'small' | 'large' = 'large';
  @Input() public loading = false;
  @Input() public set options(value: IRibbonButtonOption[]) {
    if (this._options !== value) {
      this._options = value;
      this.checkAccessIsAllowedToOptions();
    }
  }
  //#endregion

  //#region Variables
  // Both are read from templates -- `isVisible` additionally from RibbonGroupComponent's host
  // binding, which runs in that component's own pass. Signals, so the access check resolving
  // asynchronously actually reaches the screen.
  protected readonly isAccessLoaded: WritableSignal<boolean> = signal(false);

  protected authService: AuthService = inject(AuthService);
  protected destroy$: Subject<boolean> = new Subject<boolean>();

  private readonly _isVisible: WritableSignal<boolean> = signal(true);

  private _allowedActions: string[] = new Array<string>();
  private _options: IRibbonButtonOption[] = [];
  //#endregion

  //#region Properties
  public get allowedActions(): string[] {
    return this._allowedActions;
  }

  public readonly isVisible: Signal<boolean> = this._isVisible.asReadonly();

  public get options(): IRibbonButtonOption[] {
    return this._options;
  }

  protected get isButtonDisabled(): boolean {
    return this.disabled || !this.isAccessLoaded();
  }
  //#endregion

  //#region Constructor and Angular life cycle methods
  constructor() {
    super();

    this.checkAccessIsAllowed();
  }

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
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
      this.isAccessLoaded.set(true);
      this._isVisible.set(true);
      return;
    }

    this.authService
      .checkActionsAreAllowed(this.allowedActions)
      .pipe(take(1))
      .subscribe((result: boolean[]) => {
        this.isAccessLoaded.set(true);
        this._isVisible.set(result.some((isAllowed: boolean) => isAllowed === true));
      });
  }

  private checkAccessIsAllowedToOptions(): void {
    if (this.options.length === 0) {
      return;
    }

    const optionsToCheckActions: IRibbonButtonOption[] = this.options.filter(
      (option: IRibbonButtonOption) => (option.allowedActions?.length ?? 0) > 0,
    );

    if (optionsToCheckActions.length > 0) {
      optionsToCheckActions.forEach((option: IRibbonButtonOption, index: number) => {
        this.authService
          .checkActionsAreAllowed(option.allowedActions!)
          .pipe(take(1))
          .subscribe((result: boolean[]) => {
            option.isAccessAllowed = result.some((isAllowed: boolean) => isAllowed === true);
          });
      });
    }
  }
  //#endregion
}
