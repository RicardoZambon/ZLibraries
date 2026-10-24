import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ITabView, RouterFormatter } from '@zambon-dev/ui/library';
import { TabService } from '../../services';
import { ViewBase } from '../view-base';

/**
 * @deprecated Use standalone {@link TabViewBase} instead. Migrate by extending TabViewBase
 * and using standalone component imports with inject() for dependency injection.
 */
// No strategy on purpose: Angular never inherits `changeDetection`, so one declared here would
// describe a class that is never instantiated, while every subclass compiles to whatever it
// declares -- which in v22 means OnPush. Correctness comes from the state below notifying
// Angular, never from this decorator. See docs/guides/reactivity.md.
@Component({ template: '' })
export abstract class LegacyTabViewBase extends ViewBase implements OnInit, ITabView {
  title = '';
  url: string;
  activeView?: string;

  constructor(
    protected route: ActivatedRoute,
    protected tabService: TabService,
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
