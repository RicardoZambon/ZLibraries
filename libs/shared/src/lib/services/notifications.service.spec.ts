import { INotification } from '../models';
import { NotificationsService } from './notifications.service';

describe(NotificationsService.name, () => {
  let service: NotificationsService;

  function seed(notifications: INotification[]): void {
    (service as any).notifications$.next(notifications);
  }

  function latestNotifications(): INotification[] {
    let result: INotification[] = [];
    service.getNotifications().subscribe((n: INotification[]) => (result = n));
    return result;
  }

  function latestUnreadCount(): number {
    let result = -1;
    service.getUnreadCount().subscribe((c: number) => (result = c));
    return result;
  }

  beforeEach(() => {
    service = new NotificationsService();
  });

  it('starts with no notifications and a zero unread count', () => {
    expect(latestNotifications()).toEqual([]);
    expect(latestUnreadCount()).toBe(0);
  });

  it('computes the unread count from the current notifications', () => {
    seed([
      { id: '1', title: 'a', message: '', read: false, createdAt: '' },
      { id: '2', title: 'b', message: '', read: true, createdAt: '' },
      { id: '3', title: 'c', message: '', read: false, createdAt: '' },
    ]);

    expect(latestUnreadCount()).toBe(2);
  });

  it('marks a single notification as read', () => {
    seed([
      { id: '1', title: 'a', message: '', read: false, createdAt: '' },
      { id: '2', title: 'b', message: '', read: false, createdAt: '' },
    ]);

    service.markAsRead('1');

    const items: INotification[] = latestNotifications();
    expect(items.find((n: INotification) => n.id === '1')?.read).toBe(true);
    expect(items.find((n: INotification) => n.id === '2')?.read).toBe(false);
    expect(latestUnreadCount()).toBe(1);
  });

  it('marks every notification as read', () => {
    seed([
      { id: '1', title: 'a', message: '', read: false, createdAt: '' },
      { id: '2', title: 'b', message: '', read: false, createdAt: '' },
    ]);

    service.markAllAsRead();

    expect(latestUnreadCount()).toBe(0);
  });
});
