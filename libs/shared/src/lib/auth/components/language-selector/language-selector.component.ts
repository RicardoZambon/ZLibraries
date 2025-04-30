import { NgClass, NgFor } from '@angular/common';
import { Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'shared-language-selector',
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.scss'],
  imports: [
    NgClass,
    NgFor,
    TranslatePipe,
  ]
})
export class LanguageSelectorComponent {
  //#region ViewChilds, Inputs, Outputs
  @ViewChild('dropdown') public dropdown!: ElementRef<HTMLDivElement>;

  @Input() public title: string = 'LanguageSelector-Title';
  //#endregion

  //#region Variables
  protected languages: string[];
  protected showDropdown: boolean = false;
  //#endregion

  //#region Properties
  public get selectedLanguage(): string {
    return this.translate.currentLang;
  }
  //#endregion

  //#region Constructor and Angular life cycle methods
  constructor(private translate: TranslateService) {
    this.languages = this.translate.getLangs();
  }
  //#endregion

  //#region Event handlers
  public onDropdownClick(): void {
    this.showDropdown = !this.showDropdown;
  }

  public onSelectLanguage(language: string): void {
    localStorage.setItem('language', language);
    this.translate.use(language);
    this.showDropdown = false;
  }
  //#endregion

  //#region Public methods
  //#endregion

  //#region Private methods
  @HostListener('window:click', ['$event'])
  private documentClick(event: MouseEvent) {
    if (this.showDropdown) {
      let target: HTMLElement = <HTMLElement>event.target;
      while (target !== null && target.tagName?.toUpperCase() !== 'BODY') {
          if (target === this.dropdown.nativeElement) {
            return;
          }
          target = <HTMLElement>target.parentElement;
      }
      this.showDropdown = false;
    }
  }
  //#endregion
}