import { UserProfileComponent } from './user-profile.component';

describe(UserProfileComponent.name, () => {
  let component: UserProfileComponent;

  beforeEach(() => {
    component = Object.create(UserProfileComponent.prototype);
  });

  it('loads the current user on init', () => {
    const user = { name: 'Fernando Vasconcelos', costCenterName: 'IT', position: 'Gerente Sistemas TI II' };
    (component as any).authenticationService = { getUserInfo: () => user };

    component.ngOnInit();

    expect((component as any).user).toBe(user);
    expect((component as any).name).toBe('Fernando Vasconcelos');
    expect((component as any).position).toBe('Gerente Sistemas TI II');
  });

  it('derives two initials from a multi-word name', () => {
    (component as any).user = { name: 'Fernando Vasconcelos' };
    expect((component as any).initials).toBe('FV');
  });

  it('uses the first and last word for initials', () => {
    (component as any).user = { name: 'Ana Maria Silva' };
    expect((component as any).initials).toBe('AS');
  });

  it('derives a single initial from a single-word name', () => {
    (component as any).user = { name: 'Fernando' };
    expect((component as any).initials).toBe('F');
  });

  it('returns empty initials when there is no user', () => {
    (component as any).user = null;
    expect((component as any).initials).toBe('');
  });

  it('hides the position when it is absent', () => {
    (component as any).user = { name: 'Ana' };
    expect((component as any).position).toBe('');
  });

  it('exposes the picture url when present', () => {
    (component as any).user = { name: 'Ana', pictureUrl: '/avatar.png' };
    expect((component as any).pictureUrl).toBe('/avatar.png');
  });
});
