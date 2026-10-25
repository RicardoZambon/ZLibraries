import { TestBed } from '@angular/core/testing';
import { THEME_STORAGE_KEY, ThemeService } from './theme.service';

describe('ThemeService', () => {
  const attribute = () => document.documentElement.getAttribute('data-theme');

  beforeEach(() => {
    localStorage.removeItem(THEME_STORAGE_KEY);
    document.documentElement.removeAttribute('data-theme');
    TestBed.resetTestingModule();
  });

  afterAll(() => {
    localStorage.removeItem(THEME_STORAGE_KEY);
    document.documentElement.removeAttribute('data-theme');
  });

  it('applies light when nothing has been chosen and nothing is on the document', () => {
    const theme = TestBed.inject(ThemeService);
    TestBed.tick();

    expect(theme.preference()).toBe('light');
    expect(attribute()).toBe('light');
  });

  it('restores a stored choice', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');

    const theme = TestBed.inject(ThemeService);
    TestBed.tick();

    expect(theme.preference()).toBe('dark');
    expect(attribute()).toBe('dark');
  });

  it('honours an attribute already on the document when nothing is stored', () => {
    // This is what the pre-paint snippet leaves behind, and what an application that hardcodes
    // the attribute without offering a switch means. Assuming light here overwrote both as soon
    // as the first screen containing the switch rendered.
    document.documentElement.setAttribute('data-theme', 'dark');

    const theme = TestBed.inject(ThemeService);
    TestBed.tick();

    expect(theme.preference()).toBe('dark');
    expect(attribute()).toBe('dark');
  });

  it('prefers a stored choice over the attribute, because the user chose it', () => {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem(THEME_STORAGE_KEY, 'light');

    const theme = TestBed.inject(ThemeService);
    TestBed.tick();

    expect(theme.preference()).toBe('light');
    expect(attribute()).toBe('light');
  });

  it('writes the choice to the document and to storage', () => {
    const theme = TestBed.inject(ThemeService);
    TestBed.tick();

    theme.setPreference('dark');
    TestBed.tick();

    expect(attribute()).toBe('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
  });

  it('steps light, dark, system and back', () => {
    const theme = TestBed.inject(ThemeService);
    TestBed.tick();

    theme.cyclePreference();
    expect(theme.preference()).toBe('dark');

    theme.cyclePreference();
    expect(theme.preference()).toBe('system');

    theme.cyclePreference();
    expect(theme.preference()).toBe('light');
  });

  it('resolves `system` to a concrete theme, so the stylesheet never sees it', () => {
    const theme = TestBed.inject(ThemeService);
    TestBed.tick();

    theme.setPreference('system');
    TestBed.tick();

    expect(theme.preference()).toBe('system');
    expect(['light', 'dark']).toContain(theme.resolved());
    expect(['light', 'dark']).toContain(attribute());
  });
});
