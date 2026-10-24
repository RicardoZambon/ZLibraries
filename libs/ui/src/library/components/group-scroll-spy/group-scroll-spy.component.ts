import { Component, computed, contentChildren, Signal, signal, viewChild, WritableSignal } from '@angular/core';
import { ScrollSpyDirective } from '../../directives/scroll-spy.directive';
import { GroupAccordionComponent } from '../group-accordion/group-accordion.component';

@Component({
  selector: 'lib-group-scroll-spy',
  templateUrl: './group-scroll-spy.component.html',
  styleUrls: ['./group-scroll-spy.component.scss'],
  imports: [ScrollSpyDirective],
})
export class GroupScrollSpyComponent {
  public readonly scrollSpy: Signal<ScrollSpyDirective | undefined> = viewChild(ScrollSpyDirective);
  public readonly sections: Signal<readonly GroupAccordionComponent[]> = contentChildren(GroupAccordionComponent, {
    descendants: true,
  });

  // Reads each section's own label signal, so a section renaming itself refreshes the strip too.
  public readonly titles: Signal<string[]> = computed(() =>
    this.sections().map((section: GroupAccordionComponent) => section.label()),
  );

  public readonly activeSection: WritableSignal<number> = signal(0);

  public activeSectionChanged(index: number): void {
    this.activeSection.set(index);
  }

  public scrollTo(section: number): void {
    this.scrollSpy()?.scrollTo(section);
  }
}
