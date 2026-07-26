// @ts-check
const eslint = require("@eslint/js");
const { defineConfig } = require("eslint/config");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");
const boundaries = require("eslint-plugin-boundaries");

module.exports = defineConfig([
  {
    files: ["**/*.ts"],
    plugins: { boundaries },
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    settings: {
      // Only files under src/app participate in boundary checks.
      "boundaries/include": ["src/app/**/*"],
      // Map each folder to an architectural layer (first match wins).
      "boundaries/elements": [
        { type: "core", pattern: "src/app/core/**/*" },
        { type: "shared", pattern: "src/app/shared/**/*" },
        { type: "layouts", pattern: "src/app/layouts/**/*" },
        // A feature's *public* surface: its facade and its DTOs. Declared before "features" so it
        // wins the first-match, which lets a portal shell consume feature state (the org switcher,
        // the invitation badge, sign-out) without being able to reach a page or a repository.
        {
          type: "feature-api",
          mode: "file",
          pattern: "src/app/features/*/*.{facade,models,form-models}.ts",
        },
        { type: "features", pattern: "src/app/features/**/*" },
        { type: "app-root", mode: "file", pattern: "src/app/*" },
      ],
      // Resolve the @core/@shared/@features/@layouts/@env path aliases.
      "import/resolver": {
        typescript: { alwaysTryTypes: true, project: "tsconfig.json" },
      },
    },
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "app",
          style: "kebab-case",
        },
      ],
      // ── Architectural fitness rule: dependencies point inward only ──
      // core -> nothing | shared -> core | layouts -> shared,core (+ a feature's facade/models)
      // features -> layouts,shared,core | (domain purity handled by convention)
      "boundaries/element-types": [
        "error",
        {
          default: "disallow",
          rules: [
            {
              from: ["app-root"],
              allow: ["app-root", "core", "shared", "layouts", "features", "feature-api"],
            },
            { from: ["core"], allow: ["core"] },
            { from: ["shared"], allow: ["shared", "core"] },
            // A portal shell renders feature state (org switcher, invitation badge, sign-out), so
            // it may inject a feature's facade — but not its pages, routes or repositories.
            { from: ["layouts"], allow: ["layouts", "shared", "core", "feature-api"] },
            // features -> features allowed for now; tighten to same-feature-only later.
            {
              from: ["features", "feature-api"],
              allow: ["features", "feature-api", "layouts", "shared", "core"],
            },
          ],
        },
      ],
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      angular.configs.templateRecommended,
      angular.configs.templateAccessibility,
    ],
    rules: {},
  },
]);
