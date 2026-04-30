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
    c.ModalComponent,
    c.MultiEditorComponent,
    c.MultiSelectComponent,
    c.MultiSelectResultGridComponent,
    c.RibbonComponent,
    c.RibbonButtonComponent,
    c.RibbonGroupComponent,

    d.ScrollSpyDirective,

    p.EnumTranslatePipe,
    p.ReplacePipe,
    p.ReplaceManyPipe,
  ],
  exports: [
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
    c.ModalComponent,
    c.MultiEditorComponent,
    c.MultiSelectComponent,
    c.MultiSelectResultGridComponent,
    c.RibbonComponent,
    c.RibbonButtonComponent,
    c.RibbonGroupComponent,

    d.ScrollSpyDirective,

    p.EnumTranslatePipe,
    p.ReplacePipe,
    p.ReplaceManyPipe,
  ]
})
/**
 * @deprecated Use standalone component imports instead of LibraryModule.
 * Import individual components directly in your component's `imports` array.
 */
export class LibraryModule {}