import { NgClass, NgIf } from '@angular/common';
import { Component, ContentChildren, Input, QueryList, ViewChild } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ScrollSpyDirective } from '../../directives/scroll-spy.directive';
import { GroupAccordionComponent } from '../group-accordion/group-accordion.component';

@Component({
  selector: 'lib-group-container',
  templateUrl: './group-container.component.html',
  styleUrls: ['./group-container.component.scss'],
  imports: [
    NgClass,
    NgIf,
    TranslatePipe,
  ]
})
export class GroupContainerComponent {
  @ViewChild(ScrollSpyDirective) scrollSpy!: ScrollSpyDirective;
  @ContentChildren(GroupAccordionComponent, { descendants: true }) sections!: QueryList<GroupAccordionComponent>;

  public get titles(): string[] {
    return this.sections?.map(x => x.label) ?? [];
  }

  public activeSection: number = 0;
  
  @Input() title?: string;

  @Input() icon?: string;


  activeSectionChanged(index: number): void {
    this.activeSection = index;
  }

  scrollTo(section: number) {
    this.scrollSpy.scrollTo(section);
  }
}