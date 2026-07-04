import type { Preview } from '@storybook/angular';

// Global app styles/tokens are loaded automatically via the Angular
// `browserTarget` (angular.json build > styles), so stories render with
// the real theme. Add global decorators/parameters here as needed.
const preview: Preview = {
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
