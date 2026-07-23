import { AsyncPipe } from '@angular/common';
import { Component, ElementRef, HostListener, inject, ViewChild } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { INotification } from '../../../models';
import { NotificationsService } from '../../../services';

@Component({
  selector: 'shared-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  imports: [
    AsyncPipe,
    TranslatePipe,
  ],
})
export class NotificationsComponent {
  //#region ViewChilds, Inputs, Outputs
  @ViewChild('dropdown') public dropdown!: ElementRef<HTMLDivElement>;
  //#endregion

  //#region Variables
  private notificationsService: NotificationsService = inject(NotificationsService);

  protected notifications$: Observable<INotification[]> = this.notificationsService.getNotifications();
  protected unreadCount$: Observable<number> = this.notificationsService.getUnreadCount();
  protected showDropdown = false;
  //#endregion

  //#region Event handlers
  public onDropdownClick(): void {
    this.showDropdown = !this.showDropdown;
  }

  public onNotificationClick(notification: INotification): void {
    this.notificationsService.markAsRead(notification.id);
  }

  public onMarkAllAsRead(): void {
    this.notificationsService.markAllAsRead();
  }
  //#endregion

  //#region Private methods
  @HostListener('window:click', ['$event'])
  private documentClick(event: MouseEvent): void {
    if (this.showDropdown) {
      let target: HTMLElement = <HTMLElement>event.target;
      while (target !== null && target.tagName?.toUpperCase() !== 'BODY') {
        if (target === this.dropdown.nativeElement) {
          return;
        }
        target = <HTMLElement>target.parentElement;
      }
      this.showDropdown = false;
    }
  }
  //#endregion
}
