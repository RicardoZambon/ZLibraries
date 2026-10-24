import {
  Component,
  computed,
  effect,
  inject,
  input,
  InputSignal,
  model,
  ModelSignal,
  OnDestroy,
  Signal,
  viewChild,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { IRibbonButtonOption, RibbonButtonComponent, RibbonGroupChild } from '@zambon-dev/library';
import { map, Observable, of, startWith, Subject, switchMap, take } from 'rxjs';
import { AuthService } from '../../services';

/** What the access check knows at a given moment. */
interface IAccessState {
  isLoaded: boolean;
  isVisible: boolean;
}

// No strategy on purpose: Angular never inherits `changeDetection`, so one declared here would
// describe a class that is never instantiated, while every subclass compiles to whatever it
// declares -- which in v22 means OnPush. Correctness comes from the state below notifying
// Angular, never from this decorator. See docs/guides/reactivity.md.
@Component({ template: '' })
export class BaseButton extends RibbonGroupChild implements OnDestroy {
  //#region ViewChilds, Inputs, Outputs
  protected readonly button: Signal<RibbonButtonComponent | undefined> = viewChild(RibbonButtonComponent);

  public readonly allowedActions: InputSignal<string[]> = input<string[]>([]);

  // Models rather than inputs: a subclass writes all three from a constructor, a lifecycle hook
  // or a subscription -- the filters button disables itself until its grid has loaded, the
  // refresh button drives its own spinner, and the export, save and views buttons build their own
  // option lists. A plain field told Angular nothing.
  public readonly disabled: ModelSignal<boolean> = model(false);
  public readonly loading: ModelSignal<boolean> = model(false);
  public readonly options: ModelSignal<IRibbonButtonOption[]> = model<IRibbonButtonOption[]>([]);

  public readonly iconSize: InputSignal<'small' | 'large'> = input<'small' | 'large'>('large');
  //#endregion

  //#region Variables
  protected authService: AuthService = inject(AuthService);
  protected destroy$: Subject<boolean> = new Subject<boolean>();

  /**
   * Whether a button is allowed is one question asked of one input, so it is one stream rather
   * than two fields written from a subscription. It also runs once: the old setter fired the
   * check and the constructor fired it again, before any input had arrived.
   *
   * While the answer is outstanding the button is visible but not yet loaded, which is what
   * `RibbonButtonComponent` already does with an option whose access has not come back.
   */
  private readonly access: Signal<IAccessState> = toSignal(
    toObservable(this.allowedActions).pipe(
      switchMap((allowedActions: string[]) => this.checkAccessIsAllowed(allowedActions)),
    ),
    { initialValue: { isLoaded: true, isVisible: true } },
  );

  /**
   * The options whose access check has already been sent.
   *
   * Resolving one replaces that option with a copy carrying the answer, so the list below sees a
   * new array and the check runs again over it. The copy has an answer and is skipped; this set
   * is what stops an option still in flight from being asked a second time.
   */
  private readonly requestedOptions: WeakSet<IRibbonButtonOption> = new WeakSet<IRibbonButtonOption>();
  //#endregion

  //#region Properties
  public readonly isAccessLoaded: Signal<boolean> = computed(() => this.access().isLoaded);

  public override readonly isVisible: Signal<boolean> = computed(() => this.access().isVisible);

  protected get isButtonDisabled(): boolean {
    return this.disabled() || !this.isAccessLoaded();
  }
  //#endregion

  //#region Constructor and Angular life cycle methods
  /**
   * Asks for the access behind every option that declares one and has not been asked yet.
   *
   * An effect rather than a setter: `options` is written by this component's own subclasses as
   * well as bound by a host application, and both have to reach the check.
   */
  private readonly optionsAccess = effect(() => {
    const pendingOptions: IRibbonButtonOption[] = this.options().filter(
      (option: IRibbonButtonOption) =>
        (option.allowedActions?.length ?? 0) > 0 &&
        option.isAccessAllowed === undefined &&
        !this.requestedOptions.has(option),
    );

    for (const option of pendingOptions) {
      this.requestedOptions.add(option);

      this.authService
        .checkActionsAreAllowed(option.allowedActions!)
        .pipe(take(1))
        .subscribe((result: boolean[]) => {
          this.setOptionAccess(
            option,
            result.some((isAllowed: boolean) => isAllowed === true),
          );
        });
    }
  });

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  public startLoading(): void {
    this.button()?.startLoading();
  }

  public finishLoading(status: 'failure' | 'warning' | 'success'): void {
    this.button()?.finishLoading(status);
  }
  //#endregion

  //#region Private methods
  private checkAccessIsAllowed(allowedActions: string[]): Observable<IAccessState> {
    if (allowedActions.length === 0) {
      return of<IAccessState>({ isLoaded: true, isVisible: true });
    }

    return this.authService.checkActionsAreAllowed(allowedActions).pipe(
      take(1),
      map((result: boolean[]) => ({
        isLoaded: true,
        isVisible: result.some((isAllowed: boolean) => isAllowed === true),
      })),
      startWith<IAccessState>({ isLoaded: false, isVisible: true }),
    );
  }

  /**
   * Replaces one option with a copy carrying its answer, leaving the others as they are.
   *
   * The list has to be a new array for the ribbon button to see it at all, and the untouched
   * options have to keep their identity so the dropdown does not rebuild every row.
   */
  private setOptionAccess(option: IRibbonButtonOption, isAccessAllowed: boolean): void {
    this.options.update((options: IRibbonButtonOption[]) =>
      options.map((candidate: IRibbonButtonOption) =>
        candidate === option ? { ...candidate, isAccessAllowed } : candidate,
      ),
    );
  }
  //#endregion
}
