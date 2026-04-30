import type { Preview } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { storybookApplicationProviders } from '../../../tools/storybook/storybook.providers';

const preview: Preview = {
  decorators: [
    applicationConfig({
      providers: storybookApplicationProviders,
    }),
  ],
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
