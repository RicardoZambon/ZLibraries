import { AsyncPipe } from '@angular/common';
import { Component, ElementRef, HostListener, inject, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
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
export class NotificationsComponent implements OnInit {
  //#region ViewChilds, Inputs, Outputs
  @ViewChild('dropdown') public dropdown!: ElementRef<HTMLDivElement>;
  //#endregion

  //#region Variables
  private notificationsService: NotificationsService = inject(NotificationsService);
  private router: Router = inject(Router);

  protected notifications$: Observable<INotification[]> = this.notificationsService.getNotifications();
  protected showDropdown = false;
  protected unreadCount$: Observable<number> = this.notificationsService.getUnreadCount();
  //#endregion

  //#region Properties
  /** Whether the notifications feature is enabled; when false the bell is not rendered. */
  public get isEnabled(): boolean {
    return this.notificationsService.isEnabled;
  }
  //#endregion

  //#region Constructor and Angular life cycle methods
  public ngOnInit(): void {
    this.notificationsService.start();
  }
  //#endregion

  //#region Event handlers
  public onDropdownClick(): void {
    this.showDropdown = !this.showDropdown;
  }

  public onMarkAllAsRead(): void {
    this.notificationsService.markAllAsRead();
  }

  public onNotificationClick(notification: INotification): void {
    this.notificationsService.markAsRead(notification);
    this.showDropdown = false;

    const url: string | undefined = notification.callToActionUrl;
    if (!url) {
      return;
    }

    if (/^https?:\/\//i.test(url)) {
      window.open(url, '_blank', 'noopener');
    } else {
      this.router.navigateByUrl(url);
    }
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
