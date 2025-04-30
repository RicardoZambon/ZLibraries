import { ICurrentUserInfo } from './current-user-info';

export interface IAuthResponse extends ICurrentUserInfo {
  refreshToken: string;
  refreshTokenExpiration: string;
  token: string;
  username: string;
}