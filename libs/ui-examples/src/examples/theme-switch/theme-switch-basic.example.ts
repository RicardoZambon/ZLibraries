import { Component, inject } from '@angular/core';
import { ThemeService, ThemeSwitchComponent } from '@zambon-dev/ui/shared';

/**
 * The top bar's light and dark control. Each click steps light, dark, then system. The choice is
 * kept in local storage and written to `data-theme` on `<html>`.
 */
@Component({
  selector: 'example-theme-switch-basic',
  imports: [ThemeSwitchComponent],
  template: `
    <div class="flex items-center gap-3 p-4">
      <shared-theme-switch></shared-theme-switch>
      <span>Theme: {{ theme.preference() }}</span>
    </div>
  `,
})
export class ThemeSwitchBasicExample {
  protected readonly theme = inject(ThemeService);
}
