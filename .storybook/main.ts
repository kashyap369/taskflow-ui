import type { StorybookConfig } from '@storybook/angular';

const config: StorybookConfig = {
  "stories": [
    "../src/app/features/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../src/app/shared/ui/**/*.mdx",
    "../src/app/shared/ui/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding"
  ],
  "framework": "@storybook/angular"
};
export default config;
