import type { Preview } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { exampleProviders } from '../src/providers/example.providers';
import { themeGlobalTypes, themeInitialGlobals, withTheme } from './theme.decorator';

const preview: Preview = {
  decorators: [
    withTheme,
    applicationConfig({
      providers: exampleProviders,
    }),
  ],
  globalTypes: themeGlobalTypes,
  initialGlobals: themeInitialGlobals,
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
