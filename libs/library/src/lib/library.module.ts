import { NgModule } from '@angular/core';
import * as c from './components';
import * as d from './directives';
import * as p from './pipes';


@NgModule({
  declarations: [],
  imports: [
    c.CatalogSelectComponent,
    c.DataGridComponent,
    c.DataGridRowComponent,
    c.FormInputComponent,
    c.FormInputGroupComponent,
    c.FormGroupComponent,
    c.GroupAccordionComponent,
    c.GroupContainerComponent,
    c.GroupScrollSpyComponent,
    c.SidebarComponent,
    c.SidebarComponent,
    c.ModalComponent,
    c.MultiEditorComponent,
    c.MultiSelectComponent,
    c.MultiSelectResultGridComponent,
    c.RibbonComponent,
    c.RibbonButtonComponent,
    c.RibbonGroupComponent,

    d.ScrollSpyDirective,

    p.EnumPipe,
    p.ReplacePipe,
    p.ReplaceManyPipe,
  ],
  exports: [
    c.CatalogSelectComponent,
    c.DataGridComponent,
    c.FormInputComponent,
    c.FormInputGroupComponent,
    c.FormGroupComponent,
    c.GroupAccordionComponent,
    c.GroupContainerComponent,
    c.GroupScrollSpyComponent,
    c.SidebarComponent,
    c.ModalComponent,
    c.MultiEditorComponent,
    c.MultiSelectComponent,
    c.RibbonComponent,
    c.RibbonButtonComponent,
    c.RibbonGroupComponent,

    d.ScrollSpyDirective,

    p.EnumPipe,
    p.ReplacePipe,
    p.ReplaceManyPipe,
  ]
})
export class LibraryModule {}