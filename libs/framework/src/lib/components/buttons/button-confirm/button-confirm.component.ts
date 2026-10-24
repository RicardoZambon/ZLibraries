import { HttpErrorResponse } from '@angular/common/http';
import { Component, forwardRef, inject, Input, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import {
  ButtonComponent,
  type ButtonIntent,
  DataGridDataset,
  RibbonButtonComponent,
  RibbonGroupChild,
} from '@zambon-dev/library';
import { TranslatePipe } from '@ngx-translate/core';
import { Observable, take } from 'rxjs';
import { ConfirmModalComponent } from '../../modals';
import { BaseButton } from '../base-button';

@Component({
  selector: 'framework-button-confirm',
  templateUrl: './button-confirm.component.html',
  imports: [ButtonComponent, ConfirmModalComponent, RibbonButtonComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [{ provide: RibbonGroupChild, useExisting: forwardRef(() => ButtonConfirmComponent) }],
})
export class ButtonConfirmComponent extends BaseButton {
  //#region ViewChilds, Inputs, Outputs
  @ViewChild(ConfirmModalComponent) private confirmModal!: ConfirmModalComponent;

  @Input() public action!: Observable<any>;
  @Input() public color = 'text-primary-500';
  @Input() public icon!: string;
  @Input() public label!: string;
  /**
   * What the confirm button is for. Replaces `modalConfirmButtonColor`, which took a Tailwind
   * palette name -- `green-500` -- and so could neither follow a theme nor say what the button
   * meant.
   */
  @Input() public modalConfirmButtonIntent: ButtonIntent = 'danger';
  @Input() public modalConfirmButtonLabel!: string;
  @Input() public modalMessage!: string;
  @Input() public modalMessageIcon = 'fa-solid fa-circle-question';
  @Input() public modalMessageIconColor!: string;
  @Input() public modalTitle!: string;
  //#endregion

  //#region Variables
  protected gridDataset: DataGridDataset = inject(DataGridDataset);
  //#endregion

  //#region Properties
  //#endregion

  //#region Constructor and Angular life cycle methods
  constructor() {
    super();

    this.disabled = true;
  }
  //#endregion

  //#region Event handlers
  protected onButtonClicked(): void {
    this.confirmModal.toggleModal();
  }

  protected onDelete(): void {
    if (this.confirmModal.isLoading || !this.confirmModal.isShown) {
      return;
    }

    this.confirmModal.beginLoading();

    this.action.pipe(take(1)).subscribe({
      next: () => {
        this.finishLoading('success');
        this.confirmModal.finishLoading(true);
        this.gridDataset.refresh();
      },
      error: (e: HttpErrorResponse) => {
        this.confirmModal.setErrorMessage(e);
      },
    });
  }
  //#endregion

  //#region Public methods
  //#endregion

  //#region Private methods
  //#endregion
}
