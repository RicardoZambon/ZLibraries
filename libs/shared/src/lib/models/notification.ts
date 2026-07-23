export interface INotification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  /** ISO 8601 timestamp of when the notification was created. */
  createdAt: string;
}
