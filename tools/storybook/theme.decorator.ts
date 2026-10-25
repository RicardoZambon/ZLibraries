import type { Decorator, Preview } from '@storybook/angular';

/**
 * A theme picker in the Storybook toolbar.
 *
 * The packages switch theme on a `data-theme` attribute on `<html>` rather than on
 * `prefers-color-scheme`, so a story can be put in either theme by writing that attribute -- no
 * browser or operating-system setting involved. That is also what lets the style snapshot capture
 * a dark baseline: `iframe.html?...&globals=theme:dark`.
 */
export const themeGlobalTypes: Preview['globalTypes'] = {
  theme: {
    description: 'Light or dark theme',
    defaultValue: 'light',
    toolbar: {
      title: 'Theme',
      icon: 'mirror',
      items: [
        { value: 'light', title: 'Light' },
        { value: 'dark', title: 'Dark' },
      ],
      dynamicTitle: true,
    },
  },
};

export const themeInitialGlobals = { theme: 'light' };

/**
 * Writes the attribute on the document, not on a wrapper. The tokens are declared on `:root`, and
 * a story rendered inside a wrapper that carried the attribute would get the dark values while
 * anything teleported out of it -- a CDK overlay, a modal -- stayed light.
 */
declare global {
  // eslint-disable-next-line no-var
  var __FORCED_THEME__: string | undefined;
}

export const withTheme: Decorator = (story, context) => {
  // A forced theme wins over the toolbar. The style snapshot sets it before the page boots,
  // so a capture never depends on Storybook resolving a URL global -- which it does not do
  // reliably for `iframe.html`, and a silently light "dark" baseline would be worse than none.
  const theme = globalThis.__FORCED_THEME__ ?? String(context.globals['theme'] ?? 'light');
  document.documentElement.setAttribute('data-theme', theme);
  return story();
};
