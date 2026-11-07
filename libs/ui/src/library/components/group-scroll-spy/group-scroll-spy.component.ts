import { Component, computed, contentChildren, Signal, signal, viewChild, WritableSignal } from '@angular/core';
import { ScrollSpyDirective } from '../../directives/scroll-spy.directive';
import { GroupAccordionComponent } from '../group-accordion/group-accordion.component';

/**
 * A scrollable container with a strip of links, one per projected `lib-group-accordion`. The link
 * of the section in view is highlighted, and clicking a link scrolls to its section.
 */
@Component({
  selector: 'lib-group-scroll-spy',
  templateUrl: './group-scroll-spy.component.html',
  styleUrls: ['./group-scroll-spy.component.scss'],
  imports: [ScrollSpyDirective],
})
export class GroupScrollSpyComponent {
  /** The scroll-spy directive on the scrolling content area. */
  public readonly scrollSpy: Signal<ScrollSpyDirective | undefined> = viewChild(ScrollSpyDirective);
  /** The `lib-group-accordion` sections projected into the container, at any depth. */
  public readonly sections: Signal<readonly GroupAccordionComponent[]> = contentChildren(GroupAccordionComponent, {
    descendants: true,
  });

  // Reads each section's own label signal, so a section renaming itself refreshes the strip too.
  /** The section labels shown as links, in document order. */
  public readonly titles: Signal<string[]> = computed(() =>
    this.sections().map((section: GroupAccordionComponent) => section.label()),
  );

  /** Zero-based index of the section in view. Starts at `0`. */
  public readonly activeSection: WritableSignal<number> = signal(0);

  /** Sets the section in view to the given zero-based index. Called by the scroll spy. */
  public activeSectionChanged(index: number): void {
    this.activeSection.set(index);
  }

  /** Scrolls the content so the section at the given zero-based index is at the top. */
  public scrollTo(section: number): void {
    this.scrollSpy()?.scrollTo(section);
  }
}
