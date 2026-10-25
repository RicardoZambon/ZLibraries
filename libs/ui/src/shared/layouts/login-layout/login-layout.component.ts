import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { APP_CONFIG, AppConfig } from '@zambon-dev/ui/framework';

@Component({
  selector: 'shared-login-layout',
  templateUrl: './login-layout.component.html',
  styleUrls: ['./login-layout.component.scss'],
  imports: [RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    // The configuration is fixed for the application's lifetime, so this never has to change.
    '[class.has-background]': '!!backgroundUrl',
  },
})
export class LoginLayoutComponent {
  //#region ViewChilds, Inputs, Outputs
  //#endregion
  //#region Variables
  private config: AppConfig = inject(APP_CONFIG);
  //#endregion
  //#region Properties
  /** Optional photograph behind the card. Absent leaves the app backdrop showing. */
  protected get backgroundUrl(): string | undefined {
    return this.config.loginBackgroundUrl;
  }
  //#endregion
  //#region Constructor and Angular life cycle methods
  //#endregion
  //#region Event handlers
  //#endregion
  //#region Public methods
  //#endregion
  //#region Private methods
  //#endregion
}
