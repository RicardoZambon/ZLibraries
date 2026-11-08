import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, ContentChildren, Input, QueryList, ViewChild } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ScrollSpyDirective } from '../../directives/scroll-spy.directive';
import { GroupAccordionComponent } from '../group-accordion/group-accordion.component';

/**
 * A panel with a title bar, an optional icon and projected content. While `title` is empty the
 * title bar shows a loading spinner instead.
 */
@Component({
  selector: 'lib-group-container',
  templateUrl: './group-container.component.html',
  styleUrls: ['./group-container.component.scss'],
  imports: [NgClass, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupContainerComponent {
  /** A scroll-spy directive in the view. The current template has none, so this stays unset. */
  @ViewChild(ScrollSpyDirective) scrollSpy!: ScrollSpyDirective;
  /** The `lib-group-accordion` sections projected into the panel, at any depth. */
  @ContentChildren(GroupAccordionComponent, { descendants: true }) sections!: QueryList<GroupAccordionComponent>;

  /** The labels of the projected sections, in document order. */
  public get titles(): string[] {
    return this.sections?.map((x) => x.label()) ?? [];
  }

  /** Zero-based index of the active section. Starts at `0`. */
  public activeSection = 0;

  /** Panel title, as a translation key. While empty, a loading spinner is shown in its place. */
  @Input() title?: string;

  /** Font Awesome icon class shown before the title, for example `fa-user`. Shown only with a title. */
  @Input() icon?: string;

  /** Sets the active section to the given zero-based index. */
  activeSectionChanged(index: number): void {
    this.activeSection = index;
  }

  /** Scrolls to the section at the given zero-based index. Needs `scrollSpy`, which the template does not provide. */
  scrollTo(section: number) {
    this.scrollSpy.scrollTo(section);
  }
}
