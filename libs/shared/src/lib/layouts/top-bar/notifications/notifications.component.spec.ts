import { INotification } from '../../../models';
import { NotificationsComponent } from './notifications.component';

describe(NotificationsComponent.name, () => {
  let component: NotificationsComponent;
  let markAsRead: jest.Mock;
  let markAllAsRead: jest.Mock;

  beforeEach(() => {
    component = Object.create(NotificationsComponent.prototype);
    markAsRead = jest.fn();
    markAllAsRead = jest.fn();
    (component as any).notificationsService = { markAsRead, markAllAsRead };
    (component as any).showDropdown = false;
  });

  it('toggles the dropdown open and closed', () => {
    component.onDropdownClick();
    expect((component as any).showDropdown).toBe(true);

    component.onDropdownClick();
    expect((component as any).showDropdown).toBe(false);
  });

  it('marks a notification as read on click', () => {
    const notification: INotification = { id: '5', title: 't', message: 'm', read: false, createdAt: '' };

    component.onNotificationClick(notification);

    expect(markAsRead).toHaveBeenCalledWith('5');
  });

  it('marks all notifications as read', () => {
    component.onMarkAllAsRead();
    expect(markAllAsRead).toHaveBeenCalledTimes(1);
  });
});
