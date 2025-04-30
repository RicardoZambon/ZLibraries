import { NgModule } from '@angular/core';
import { ButtonDeleteComponent } from './button-delete/button-delete.component';
import { ButtonEditComponent } from './button-edit/button-edit.component';
import { ButtonFiltersComponent } from './button-filters/button-filters.component';
import { ButtonNewComponent } from './button-new/button-new.component';
import { ButtonOpenRecordComponent } from './button-open-record/button-open-record.component';
import { ButtonRefreshComponent } from './button-refresh/button-refresh.component';
import { ButtonSaveComponent } from './button-save/button-save.component';
import { ButtonViewsComponent } from './button-views/button-views.component';
import { ButtonEditLegacyComponent, ButtonNewLegacyComponent, ButtonOpenRecordLegacyComponent, ButtonSaveLegacyComponent, ButtonViewsLegacyComponent } from './legacy';


@NgModule({
  declarations: [],
  imports: [
    ButtonDeleteComponent,
    ButtonEditComponent,
    ButtonFiltersComponent,
    ButtonNewComponent,
    ButtonOpenRecordComponent,
    ButtonRefreshComponent,
    ButtonSaveComponent,
    ButtonViewsComponent,
    
    ButtonNewLegacyComponent,
    ButtonEditLegacyComponent,
    ButtonSaveLegacyComponent,
    ButtonViewsLegacyComponent,
    ButtonOpenRecordLegacyComponent,
  ],
  exports: [
    ButtonDeleteComponent,
    ButtonEditComponent,
    ButtonFiltersComponent,
    ButtonNewComponent,
    ButtonOpenRecordComponent,
    ButtonRefreshComponent,
    ButtonSaveComponent,
    ButtonViewsComponent,

    ButtonNewLegacyComponent,
    ButtonEditLegacyComponent,
    ButtonSaveLegacyComponent,
    ButtonViewsLegacyComponent,
    ButtonOpenRecordLegacyComponent,
  ]
})
export class FrameworkButtonsModule { }