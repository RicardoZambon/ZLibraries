import {
  Component,
  ElementRef,
  HostListener,
  inject,
  input,
  InputSignal,
  signal,
  Signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ButtonComponent } from '@zambon-dev/ui/library';
import { LangChangeEvent, TranslatePipe, TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs';

@Component({
  selector: 'shared-language-selector',
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.scss'],
  imports: [ButtonComponent, TranslatePipe],
})
export class LanguageSelectorComponent {
  //#region ViewChilds, Inputs, Outputs
  public readonly dropdown: Signal<ElementRef<HTMLDivElement> | undefined> =
    viewChild<ElementRef<HTMLDivElement>>('dropdown');

  /** When true, the toggle shows the current language's flag (light-gray button) instead of text. */
  public readonly showFlag: InputSignal<boolean> = input(false);

  public readonly title: InputSignal<string> = input('LanguageSelector-Title');
  //#endregion

  //#region Variables
  private translate: TranslateService = inject(TranslateService);

  protected languages: string[] = this.translate.getLangs();

  // A signal rather than a field: the list is also closed from a window click handler, which
  // is not a binding on this view and so marks nothing.
  protected readonly showDropdown: WritableSignal<boolean> = signal(false);

  /**
   * `TranslateService.currentLang` is a plain field. The flag on the toggle and the tick beside
   * the chosen entry are read from it, and switching language changed neither until something
   * else happened to refresh this view. Mirrored from the service's own event instead.
   */
  private readonly currentLang: Signal<string> = toSignal(
    this.translate.onLangChange.pipe(map((event: LangChangeEvent) => event.lang)),
    { initialValue: this.translate.currentLang },
  );
  //#endregion

  //#region Properties
  public get selectedLanguage(): string {
    return this.currentLang();
  }
  //#endregion

  //#region Constructor and Angular life cycle methods
  //#endregion

  //#region Event handlers
  public onDropdownClick(): void {
    this.showDropdown.update((isShown: boolean) => !isShown);
  }

  public onSelectLanguage(language: string): void {
    localStorage.setItem('language', language);
    this.translate.use(language);
    this.showDropdown.set(false);
  }
  //#endregion

  //#region Public methods
  //#endregion

  //#region Private methods
  @HostListener('window:click', ['$event'])
  protected documentClick(event: MouseEvent): void {
    if (this.showDropdown()) {
      let target: HTMLElement = <HTMLElement>event.target;
      while (target !== null && target.tagName?.toUpperCase() !== 'BODY') {
        if (target === this.dropdown()?.nativeElement) {
          return;
        }
        target = <HTMLElement>target.parentElement;
      }
      this.showDropdown.set(false);
    }
  }
  //#endregion
}
