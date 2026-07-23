import { EnvironmentBadgeComponent } from './environment-badge.component';

describe(EnvironmentBadgeComponent.name, () => {
  let component: EnvironmentBadgeComponent;

  function setup(environment: string): void {
    component = Object.create(EnvironmentBadgeComponent.prototype);
    (component as any).config = { environment };
  }

  it('normalizes the environment to uppercase and trims it', () => {
    setup('  qa ');
    expect((component as any).environment).toBe('QA');
  });

  it('is visible for non-production environments', () => {
    setup('QA');
    expect((component as any).isVisible).toBe(true);
  });

  it('is hidden in production', () => {
    setup('PROD');
    expect((component as any).isVisible).toBe(false);
  });

  it('is hidden when no environment is configured', () => {
    setup('');
    expect((component as any).isVisible).toBe(false);
  });

  it('maps known environments to their color classes', () => {
    setup('DEV');
    expect((component as any).badgeClass).toBe('env-dev');
    setup('QA');
    expect((component as any).badgeClass).toBe('env-qa');
    setup('STG');
    expect((component as any).badgeClass).toBe('env-stg');
  });

  it('falls back to a neutral class for unknown environments', () => {
    setup('SANDBOX');
    expect((component as any).badgeClass).toBe('env-neutral');
  });
});
