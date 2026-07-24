import { Component, inject } from '@angular/core';
import { APP_CONFIG, AppConfig } from '@zambon-dev/framework';

@Component({
  selector: 'shared-brand',
  templateUrl: './brand.component.html',
  styleUrls: ['./brand.component.scss'],
})
export class BrandComponent {
  //#region Variables
  private config: AppConfig = inject(APP_CONFIG);
  //#endregion

  //#region Properties
  protected get appName(): string {
    return this.config.appName;
  }

  protected get companyName(): string {
    return this.config.companyName;
  }

  protected get logoUrl(): string | undefined {
    return this.config.logoUrl;
  }
  //#endregion
}
