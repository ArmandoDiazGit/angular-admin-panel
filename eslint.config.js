// @ts-check
const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");
const importPlugin = require("eslint-plugin-import");

module.exports = tseslint.config(
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    plugins: {
      import: importPlugin,
    },
    settings: {
      "import/resolver": {
        typescript: {
          project: "./tsconfig.json",
        },
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
          type: ["element", "attribute"],
          prefix: "app",
          style: "kebab-case",
        },
      ],
      /*
       * Architectural boundaries. Features are self-contained: they may import
       * shared/ and core/, but never another feature. shared/ and core/ must not
       * depend on a feature.
       */
      "import/no-restricted-paths": [
        "error",
        {
          zones: [
            {
              target: "./src/app/features/bookings",
              from: "./src/app/features",
              except: ["./bookings"],
              message:
                "Features must not import each other. Move shared code to src/app/shared.",
            },
            {
              target: "./src/app/shared",
              from: "./src/app/features",
              message: "src/app/shared must not depend on a feature.",
            },
            {
              target: "./src/app/core",
              from: "./src/app/features",
              message: "src/app/core must not depend on a feature.",
            },
            {
              target: "./src/app/core",
              from: "./src/app/shared",
              message: "src/app/core must not depend on shared UI.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    rules: {},
  }
);
