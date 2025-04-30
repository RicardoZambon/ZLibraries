import { NgModule } from '@angular/core';
import { DefaultDetailsTabViewComponent } from './default-details-tab-view/default-details-tab-view.component';
import { DefaultTabViewComponent } from './default-tab-view/default-tab-view.component';
import { TabBreadcrumbsComponent } from './tab-breadcrumbs/tab-breadcrumbs.component';
import { TabsComponent } from './tabs/tabs.component';


@NgModule({
  declarations: [],
  imports: [
    DefaultDetailsTabViewComponent,
    DefaultTabViewComponent,
    TabBreadcrumbsComponent,
    TabsComponent,
  ],
  exports: [
    DefaultDetailsTabViewComponent,
    DefaultTabViewComponent,
    TabsComponent,
  ]
})
export class FrameworkViewsModule { }