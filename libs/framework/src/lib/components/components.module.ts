import { NgModule } from '@angular/core';
import { FrameworkButtonsModule } from './buttons/buttons.module';
import { FrameworkModalsModule } from './modals/modals.module';
import { FrameworkViewsModule } from './views/views.module';


@NgModule({
  declarations: [],
  imports: [],
  exports: [
    FrameworkButtonsModule,
    FrameworkModalsModule,
    FrameworkViewsModule,
  ]
})
/**
 * @deprecated Use standalone component imports instead of FrameworkComponentsModule.
 * Import individual components directly in your component's `imports` array.
 */
export class FrameworkComponentsModule { }