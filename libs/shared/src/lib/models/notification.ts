export interface INotification {
  /** Short heading for the notification. */
  title: string;

  /** Longer descriptive text. */
  description: string;

  /** Icon class shown next to the notification (e.g. a Font Awesome class like `fa-solid fa-envelope`). */
  icon: string;

  /** Optional call-to-action URL. When present, clicking the notification navigates to it. */
  callToActionUrl?: string;

  /** Whether the notification has been read. */
  isRead: boolean;
}
