import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { ICurrentUserInfo } from '../../../models';
import { AuthenticationService } from '../../../services';

@Component({
  selector: 'shared-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent implements OnInit {
  //#region Variables
  private authenticationService: AuthenticationService = inject(AuthenticationService);

  // A signal rather than a field: the top bar renders the name and the avatar, and this is
  // only filled in ngOnInit -- after the first pass has already been and gone.
  protected readonly user: WritableSignal<ICurrentUserInfo | null> = signal(null);
  //#endregion

  //#region Properties
  /** Up to two uppercase initials derived from the user's name, used when no picture is set. */
  protected get initials(): string {
    const parts: string[] = this.name
      .trim()
      .split(/\s+/)
      .filter((p: string) => p.length > 0);
    if (parts.length === 0) {
      return '';
    }

    const first: string = parts[0].charAt(0);
    const last: string = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
    return (first + last).toUpperCase();
  }

  protected get name(): string {
    return this.user()?.name ?? '';
  }

  protected get pictureUrl(): string | undefined {
    return this.user()?.pictureUrl;
  }

  protected get position(): string {
    return this.user()?.position ?? '';
  }
  //#endregion

  //#region Constructor and Angular life cycle methods
  public ngOnInit(): void {
    this.user.set(this.authenticationService.getUserInfo());
  }
  //#endregion
}
