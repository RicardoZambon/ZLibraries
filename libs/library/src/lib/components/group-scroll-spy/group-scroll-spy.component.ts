import { NgFor } from '@angular/common';
import { Component, ContentChildren, QueryList, ViewChild } from '@angular/core';
import { ScrollSpyDirective } from '../../directives/scroll-spy.directive';
import { GroupAccordionComponent } from '../group-accordion/group-accordion.component';

@Component({
  selector: 'lib-group-scroll-spy',
  templateUrl: './group-scroll-spy.component.html',
  styleUrls: ['./group-scroll-spy.component.scss'],
  imports: [
    NgFor,
    ScrollSpyDirective,
  ]
})
export class GroupScrollSpyComponent {
  @ViewChild(ScrollSpyDirective) scrollSpy!: ScrollSpyDirective;
  @ContentChildren(GroupAccordionComponent, { descendants: true }) sections!: QueryList<GroupAccordionComponent>;

  public get titles(): string[] {
    return this.sections?.map(x => x.label) ?? [];
  }

  public activeSection: number = 0;  


  activeSectionChanged(index: number): void {
    this.activeSection = index;
  }

  scrollTo(section: number) {
    this.scrollSpy.scrollTo(section);
  }
}