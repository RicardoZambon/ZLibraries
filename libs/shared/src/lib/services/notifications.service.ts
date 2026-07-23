import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { INotification } from '../models';

/**
 * Provides the notifications shown in the top bar.
 *
 * The data is currently seeded with placeholder notifications. When the ZWebAPI
 * notifications endpoint is available, replace the body of {@link loadNotifications}
 * with the corresponding HTTP call (inject `HttpClient` + `APP_CONFIG` and POST/GET
 * against `${config.BASE_URL}/Notifications`, following `AuthenticationService`). No
 * consumer of this service needs to change.
 */
@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  //#region Variables
  private notifications$: BehaviorSubject<INotification[]> = new BehaviorSubject<INotification[]>([]);
  //#endregion

  //#region Constructor and Angular life cycle methods
  constructor() {
    this.notifications$.next(this.loadNotifications());
  }
  //#endregion

  //#region Public methods
  /** Emits the current list of notifications, most recent first. */
  public getNotifications(): Observable<INotification[]> {
    return this.notifications$.asObservable();
  }

  /** Emits the number of unread notifications. */
  public getUnreadCount(): Observable<number> {
    return this.notifications$.pipe(
      map((notifications: INotification[]) => notifications.filter((n: INotification) => !n.read).length),
    );
  }

  /** Marks a single notification as read. */
  public markAsRead(id: string): void {
    this.notifications$.next(
      this.notifications$.value.map((n: INotification) => (n.id === id ? { ...n, read: true } : n)),
    );
  }

  /** Marks every notification as read. */
  public markAllAsRead(): void {
    this.notifications$.next(this.notifications$.value.map((n: INotification) => ({ ...n, read: true })));
  }
  //#endregion

  //#region Private methods
  /**
   * Returns the placeholder notifications.
   *
   * TODO: replace with the ZWebAPI notifications endpoint call once available.
   */
  private loadNotifications(): INotification[] {
    return [];
  }
  //#endregion
}
