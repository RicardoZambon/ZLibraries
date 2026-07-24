import { INotification } from '../../../models';
import { NotificationsComponent } from './notifications.component';

describe(NotificationsComponent.name, () => {
  let component: NotificationsComponent;
  let markAsRead: jest.Mock;
  let markAllAsRead: jest.Mock;
  let start: jest.Mock;
  let navigateByUrl: jest.Mock;

  beforeEach(() => {
    component = Object.create(NotificationsComponent.prototype);
    markAsRead = jest.fn();
    markAllAsRead = jest.fn();
    start = jest.fn();
    navigateByUrl = jest.fn();
    (component as any).notificationsService = { markAsRead, markAllAsRead, start, isEnabled: true };
    (component as any).router = { navigateByUrl };
    (component as any).showDropdown = false;
  });

  it('starts the notifications service on init', () => {
    component.ngOnInit();
    expect(start).toHaveBeenCalledTimes(1);
  });

  it('reflects the service enabled state', () => {
    expect(component.isEnabled).toBe(true);
  });

  it('toggles the dropdown open and closed', () => {
    component.onDropdownClick();
    expect((component as any).showDropdown).toBe(true);
    component.onDropdownClick();
    expect((component as any).showDropdown).toBe(false);
  });

  it('marks a notification as read and navigates internally on click', () => {
    const item: INotification = { title: 't', description: 'd', icon: 'fa-solid fa-bell', callToActionUrl: '/records/1', isRead: false };

    component.onNotificationClick(item);

    expect(markAsRead).toHaveBeenCalledWith(item);
    expect(navigateByUrl).toHaveBeenCalledWith('/records/1');
    expect((component as any).showDropdown).toBe(false);
  });

  it('does not navigate when the notification has no call to action', () => {
    const item: INotification = { title: 't', description: 'd', icon: 'fa-solid fa-bell', isRead: false };

    component.onNotificationClick(item);

    expect(markAsRead).toHaveBeenCalledWith(item);
    expect(navigateByUrl).not.toHaveBeenCalled();
  });

  it('marks all notifications as read', () => {
    component.onMarkAllAsRead();
    expect(markAllAsRead).toHaveBeenCalledTimes(1);
  });
});
