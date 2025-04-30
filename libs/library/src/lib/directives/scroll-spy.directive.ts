import { AfterViewInit, Directive, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Directive({
  selector: '[libScrollSpy]'
})
export class ScrollSpyDirective implements AfterViewInit {
  //#region ViewChilds, Inputs, Outputs
  @Input() public spiedTags: Array<string> = [];

  @Output() public activeSectionChange = new EventEmitter<number>();
  //#endregion

  //#region Host listeners
  @HostListener('scroll', ['$event'])
  onScroll(event: any): void {
    const scrollTop = event.target.scrollTop;
    const scrollHeight = event.target.scrollHeight;
    const maxScroll = Math.round(event.target.scrollHeight - event.target.getBoundingClientRect().height);
    
    const currentScroll = Math.round(scrollTop * scrollHeight / maxScroll);

    if (currentScroll >= scrollHeight) {
      this.select(this.sections.length - 1);
      return;
    }

    const elements = this.sections.filter(el => ((el as HTMLElement).offsetTop) <= currentScroll);

    this.select(elements.length > 0 ? elements.length -1 : 0);
  }
  //#endregion

  //#region Variables
  private activeSection: number | null = null;
  private sections = new Array<Element>();
  //#endregion

  //#region Properties
  //#endregion
  
  //#region Constructor and Angular life cycle methods
  constructor(private _el: ElementRef<HTMLElement>) {
  }

  ngAfterViewInit() {
    this.updateSections(Array.from(this._el.nativeElement.children));
  }
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  public scrollTo(section: number): void {
    this._el.nativeElement.scrollTop = (this.sections[section] as HTMLElement).offsetTop;
  }
  public select(section: number): void {
    if (section !== this.activeSection) {
      this.activeSection = section;
      this.activeSectionChange.emit(section);
    }
  }
  //#endregion

  //#region Private methods
  private updateSections(children: Element[]) {
    children.forEach(el => {
      if (this.spiedTags.some(spiedTag => spiedTag.toUpperCase() === el.tagName.toUpperCase())) {
        this.sections.push(el);
      } else {
        this.updateSections(Array.from(el.children));
      }
    });
  }
  //#endregion
}