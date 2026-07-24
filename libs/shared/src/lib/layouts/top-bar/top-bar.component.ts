import { Component, EventEmitter, Output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageSelectorComponent } from '../../auth/components/language-selector/language-selector.component';
import { BrandComponent } from './brand/brand.component';
import { EnvironmentBadgeComponent } from './environment-badge/environment-badge.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { UserProfileComponent } from './user-profile/user-profile.component';

@Component({
  selector: 'shared-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss'],
  imports: [
    BrandComponent,
    EnvironmentBadgeComponent,
    LanguageSelectorComponent,
    NotificationsComponent,
    TranslatePipe,
    UserProfileComponent,
  ],
})
export class TopBarComponent {
  //#region ViewChilds, Inputs, Outputs
  /** Emitted when the sidebar collapse button is clicked. */
  @Output() public collapse: EventEmitter<void> = new EventEmitter<void>();

  /** Emitted when the logout button is clicked. */
  @Output() public logout: EventEmitter<void> = new EventEmitter<void>();
  //#endregion

  //#region Event handlers
  public onCollapseClick(): void {
    this.collapse.emit();
  }

  public onLogoutClick(): void {
    this.logout.emit();
  }
  //#endregion
}
