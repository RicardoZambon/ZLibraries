import { BehaviorSubject } from 'rxjs';
import { INotification } from '../models';
import { NotificationsService } from './notifications.service';

function makeService(config: unknown, seed: INotification[] = []): NotificationsService {
  const service: NotificationsService = Object.create(NotificationsService.prototype);
  (service as any).config = config;
  (service as any).notifications$ = new BehaviorSubject<INotification[]>(seed);
  return service;
}

function notification(title: string, isRead: boolean): INotification {
  return { title, description: 'desc', icon: 'fa-solid fa-bell', isRead };
}

describe(NotificationsService.name, () => {
  it('is disabled when the feature flag is off', () => {
    expect(makeService({ notificationsEnabled: false, notificationsUrl: 'https://h/hub' }).isEnabled).toBe(false);
  });

  it('is disabled when no hub url is configured', () => {
    expect(makeService({ notificationsEnabled: true, notificationsUrl: '' }).isEnabled).toBe(false);
  });

  it('is enabled when toggled on with a hub url', () => {
    expect(makeService({ notificationsEnabled: true, notificationsUrl: 'https://h/hub' }).isEnabled).toBe(true);
  });

  it('counts unread notifications', () => {
    const service: NotificationsService = makeService({}, [
      notification('a', false),
      notification('b', true),
      notification('c', false),
    ]);

    let count = -1;
    service.getUnreadCount().subscribe((c: number) => (count = c));
    expect(count).toBe(2);
  });

  it('marks a single notification as read', () => {
    const items: INotification[] = [notification('a', false), notification('b', false)];
    const service: NotificationsService = makeService({}, items);

    service.markAsRead(items[0]);

    let list: INotification[] = [];
    service.getNotifications().subscribe((l: INotification[]) => (list = l));
    expect(list[0].isRead).toBe(true);
    expect(list[1].isRead).toBe(false);
  });

  it('marks every notification as read', () => {
    const service: NotificationsService = makeService({}, [notification('a', false), notification('b', false)]);

    service.markAllAsRead();

    let count = -1;
    service.getUnreadCount().subscribe((c: number) => (count = c));
    expect(count).toBe(0);
  });
});
