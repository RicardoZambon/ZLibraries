import { NgModule } from '@angular/core';
import { FrameworkComponentsModule } from './components';

@NgModule({
  declarations: [],
  imports: [],
  exports: [
    FrameworkComponentsModule,
  ],
})
/**
 * @deprecated Use standalone component imports instead of FrameworkModule.
 * Import individual components directly in your component's `imports` array.
 */
export class FrameworkModule {}