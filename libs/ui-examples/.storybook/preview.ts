import type { Preview } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { storybookApplicationProviders } from '../../../tools/storybook/storybook.providers';
import { themeGlobalTypes, themeInitialGlobals, withTheme } from '../../../tools/storybook/theme.decorator';

const preview: Preview = {
  decorators: [
    withTheme,
    applicationConfig({
      providers: storybookApplicationProviders,
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
