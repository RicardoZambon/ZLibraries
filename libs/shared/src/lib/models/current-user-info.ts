export interface ICurrentUserInfo {
  costCenterName: string;
  name: string;

  /** Optional avatar image URL. Falls back to initials when absent. */
  pictureUrl?: string;

  /** Optional job position/title shown under the user name. Line is hidden when absent. */
  position?: string;
}
