import { EventEmitter } from '@angular/core';
import { TopBarComponent } from './top-bar.component';

describe(TopBarComponent.name, () => {
  let component: TopBarComponent;

  beforeEach(() => {
    component = Object.create(TopBarComponent.prototype);
    (component as any).logout = new EventEmitter<void>();
  });

  it('emits the logout event when the logout button is clicked', () => {
    const spy: jest.Mock = jest.fn();
    component.logout.subscribe(spy);

    component.onLogoutClick();

    expect(spy).toHaveBeenCalledTimes(1);
  });
});
