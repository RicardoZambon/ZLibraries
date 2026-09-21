import { Component, provideZoneChangeDetection, ChangeDetectionStrategy } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

@Component({
  selector: 'zambon-storybook-host',
  changeDetection: ChangeDetectionStrategy.Eager,
  template: '',
})
class StorybookHostComponent {}

bootstrapApplication(StorybookHostComponent, { providers: [provideZoneChangeDetection()] }).catch((error) =>
  console.error(error),
);
