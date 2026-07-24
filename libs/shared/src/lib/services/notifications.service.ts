import { inject, Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { APP_CONFIG, AppConfig, AuthService } from '@zambon-dev/framework';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { INotification } from '../models';

/**
 * Streams top-bar notifications from a SignalR hub.
 *
 * The hub is configured via `AppConfig.notificationsEnabled` and `AppConfig.notificationsUrl`.
 * When enabled, {@link start} opens a connection (authenticated with the current JWT) and
 * listens for the server to push the notification list via the `ReceiveNotifications` client
 * method. Consuming apps do not interact with this service directly — the top bar drives it.
 */
@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  //#region Variables
  private config: AppConfig = inject(APP_CONFIG);
  private authService: AuthService = inject(AuthService);

  private notifications$: BehaviorSubject<INotification[]> = new BehaviorSubject<INotification[]>([]);
  private connection?: HubConnection;
  //#endregion

  //#region Properties
  /** Whether the notifications feature is enabled (toggled on and given a hub URL). */
  public get isEnabled(): boolean {
    return this.config.notificationsEnabled && this.config.notificationsUrl.length > 0;
  }
  //#endregion

  //#region Public methods
  /** Emits the current list of notifications. */
  public getNotifications(): Observable<INotification[]> {
    return this.notifications$.asObservable();
  }

  /** Emits the number of unread notifications. */
  public getUnreadCount(): Observable<number> {
    return this.notifications$.pipe(
      map((notifications: INotification[]) => notifications.filter((n: INotification) => !n.isRead).length),
    );
  }

  /** Opens the SignalR connection and starts receiving notifications. Idempotent and a no-op when disabled. */
  public start(): void {
    if (!this.isEnabled || !!this.connection) {
      return;
    }

    this.connection = new HubConnectionBuilder()
      .withUrl(this.config.notificationsUrl, {
        accessTokenFactory: () => this.authService.token ?? '',
      })
      .withAutomaticReconnect()
      .build();

    this.connection.on('ReceiveNotifications', (notifications: INotification[]) => {
      this.notifications$.next(notifications ?? []);
    });

    this.connection.start().catch((error: unknown) => {
      console.error('Failed to connect to the notifications hub.', error);
    });
  }

  /** Closes the SignalR connection. */
  public async stop(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = undefined;
    }
  }

  /** Marks a single notification as read (optimistically; the server reconciles on the next push). */
  public markAsRead(notification: INotification): void {
    this.notifications$.next(
      this.notifications$.value.map((n: INotification) => (n === notification ? { ...n, isRead: true } : n)),
    );
  }

  /** Marks every notification as read and notifies the hub. */
  public markAllAsRead(): void {
    this.notifications$.next(this.notifications$.value.map((n: INotification) => ({ ...n, isRead: true })));

    if (this.connection?.state === HubConnectionState.Connected) {
      this.connection.invoke('MarkAllAsRead').catch((error: unknown) => {
        console.error('Failed to mark notifications as read on the hub.', error);
      });
    }
  }
  //#endregion
}
