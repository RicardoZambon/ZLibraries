import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

@Component({
  selector: 'zambon-storybook-host',
  template: '',
})
class StorybookHostComponent {}

bootstrapApplication(StorybookHostComponent).catch((error) => console.error(error));
