import { BrandComponent } from './brand.component';

describe(BrandComponent.name, () => {
  let component: BrandComponent;

  beforeEach(() => {
    component = Object.create(BrandComponent.prototype);
  });

  it('exposes the app name, company name and logo from the app config', () => {
    (component as any).config = {
      appName: 'Engineering Change',
      companyName: 'Zilia Technologies',
      logoUrl: '/assets/logo.png',
    };

    expect((component as any).appName).toBe('Engineering Change');
    expect((component as any).companyName).toBe('Zilia Technologies');
    expect((component as any).logoUrl).toBe('/assets/logo.png');
  });

  it('returns an undefined logo when none is configured', () => {
    (component as any).config = { appName: 'App', companyName: 'Co' };
    expect((component as any).logoUrl).toBeUndefined();
  });
});
