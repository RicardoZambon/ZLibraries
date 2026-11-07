import { setupZonelessTestEnv } from 'jest-preset-angular/setup-env/zoneless';

// Zoneless on purpose, and not only because it is where the libraries are going. Under the zone
// environment there is an ambient tick on every timer, XHR and EventEmitter.emit, which refreshes
// a component that notified nothing and hides the exact failure these packages exist to prevent.
// Here a view renders only when something marks the path dirty.
setupZonelessTestEnv({
  errorOnUnknownElements: true,
  errorOnUnknownProperties: true,
});
