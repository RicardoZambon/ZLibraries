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
export class FrameworkModalsModule { }