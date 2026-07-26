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
    // `@storybook/addon-a11y` runs axe-core against every story. 'error' makes a violation fail the
    // story rather than just annotate it, so a new component can't land inaccessible. Colour-contrast
    // is checked here per-component; the token pairings themselves are covered by
    // `npm run a11y:contrast`, which axe can't see because it only tests what a story renders.
    a11y: {
      test: 'error',
    },
  },
};

export default preview;
