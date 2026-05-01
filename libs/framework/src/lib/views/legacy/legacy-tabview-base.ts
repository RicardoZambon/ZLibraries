import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ITabView, RouterFormatter } from '@zambon-dev/library';
import { TabService } from '../../services';
import { ViewBase } from '../view-base';

/**
 * @deprecated Use standalone {@link TabViewBase} instead. Migrate by extending TabViewBase
 * and using standalone component imports with inject() for dependency injection.
 */
@Component({ template: '' })
export abstract class LegacyTabViewBase extends ViewBase implements OnInit, ITabView {

  title: string = '';
  url: string;
  activeView?: string;

  
  constructor(
    protected route: ActivatedRoute,
    protected tabService: TabService
  ) {
    super();
    
    this.url = RouterFormatter.getURL(this.route.snapshot);
  }

  ngOnInit(): void {
    this.openTabView();
  }


  protected openTabView() {
    // this.tabService.openView(this);
  }

  protected updateTitle(title: string): void {
    this.title = title;
    this.tabService.updateTabTitle(this.url, title);
  }
}