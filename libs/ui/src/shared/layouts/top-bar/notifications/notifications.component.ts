import { AsyncPipe } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  inject,
  OnInit,
  signal,
  Signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { INotification } from '../../../models';
import { NotificationsService } from '../../../services';
import { ButtonComponent } from '@zambon-dev/ui/library';

/**
 * Bell with an unread count that opens a list of notifications. Clicking one marks it as read
 * and follows its link: external URLs open in a new window, others navigate in the app.
 */
@Component({
  selector: 'shared-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  imports: [AsyncPipe, ButtonComponent, TranslatePipe],
})
export class NotificationsComponent implements OnInit {
  //#region ViewChilds, Inputs, Outputs
  /** The open notifications panel; clicks inside it do not close it. */
  public readonly dropdown: Signal<ElementRef<HTMLDivElement> | undefined> =
    viewChild<ElementRef<HTMLDivElement>>('dropdown');
  //#endregion

  //#region Variables
  private notificationsService: NotificationsService = inject(NotificationsService);
  private router: Router = inject(Router);

  protected notifications$: Observable<INotification[]> = this.notificationsService.getNotifications();
  // A signal rather than a field: the panel is also closed from a window click handler, which
  // is not a binding on this view and so marks nothing.
  protected readonly showDropdown: WritableSignal<boolean> = signal(false);
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
  /** Opens or closes the notifications panel. */
  public onDropdownClick(): void {
    this.showDropdown.update((isShown: boolean) => !isShown);
  }

  /** Marks every notification as read. */
  public onMarkAllAsRead(): void {
    this.notificationsService.markAllAsRead();
  }

  /** Marks the notification as read, closes the panel and follows its `callToActionUrl`, if any. */
  public onNotificationClick(notification: INotification): void {
    this.notificationsService.markAsRead(notification);
    this.showDropdown.set(false);

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
  protected documentClick(event: MouseEvent): void {
    if (this.showDropdown()) {
      let target: HTMLElement = <HTMLElement>event.target;
      while (target !== null && target.tagName?.toUpperCase() !== 'BODY') {
        if (target === this.dropdown()?.nativeElement) {
          return;
        }
        target = <HTMLElement>target.parentElement;
      }
      this.showDropdown.set(false);
    }
  }
  //#endregion
}
