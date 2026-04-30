import { NgModule } from '@angular/core';
import { ConfirmModalComponent } from './confirm-modal/confirm-modal.component';
import { ErrorModalComponent } from './error-modal/error-modal.component';


@NgModule({
  declarations: [],
  imports: [
    ConfirmModalComponent,
    ErrorModalComponent,
  ],
  exports: [
    ConfirmModalComponent,
    ErrorModalComponent,
  ]
})
/**
 * @deprecated Use standalone component imports instead of FrameworkModalsModule.
 * Import individual components directly in your component's `imports` array.
 */
export class FrameworkModalsModule { }