import { Component } from '@angular/core';
import { LoginComponent, LoginLayoutComponent } from '@zambon-dev/ui/shared';

/**
 * The sign-in card on its layout. In an application, SharedAuthModule routes to the pair at
 * `/login`; placed by hand they render the same. The labels come from the shared translations,
 * and signing in calls AuthenticationService, which this example replaces with a stub.
 */
@Component({
  selector: 'example-login-card',
  imports: [LoginComponent, LoginLayoutComponent],
  template: `
    <div class="h-[40rem]">
      <shared-login-layout>
        <shared-login></shared-login>
      </shared-login-layout>
    </div>
  `,
})
export class LoginCardExample {}
