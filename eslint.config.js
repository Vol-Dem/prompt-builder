import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import importPlugin from "eslint-plugin-import";
import jsxA11y from "eslint-plugin-jsx-a11y";
import prettier from "eslint-config-prettier";
import { globalIgnores } from "eslint/config";

const typescriptFiles = [
  "src/**/*.{ts,tsx}",
  "shared/**/*.ts",
  "functions/src/**/*.ts",
  "vite.config.ts",
];

export default [
  js.configs.recommended,
  globalIgnores([
    "**/node_modules/**",
    "dist/**",
    "functions/lib/**",
    "shared/types/image.js", // TypeScript-emitted stub; the source is image.ts.
  ]),
  {
    files: ["**/*.{js,jsx}", ...typescriptFiles],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
  },
  {
    files: typescriptFiles,
    languageOptions: {
      parser: tseslint.parser,
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      // TypeScript handles undefined names and redeclarations.
      "no-undef": "off",
      "no-redeclare": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],

      // Keep newly covered source findings advisory during lint adoption.
      "no-extra-boolean-cast": "warn",
      "no-useless-escape": "warn",
      "no-unsafe-optional-chaining": "warn",
      "no-irregular-whitespace": "warn",
    },
  },
  {
    files: ["src/**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },

    plugins: {
      react,
      "react-hooks": reactHooks,
      "jsx-a11y": jsxA11y,
    },

    settings: {
      react: {
        version: "detect",
      },
    },

    rules: {
      // React 17+
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-vars": "error",

      // Hooks
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
  {
    files: [
      "*.{js,ts}",
      "functions/**/*.{js,ts}",
      "**/*.{test,spec}.{js,jsx,ts,tsx}",
    ],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ["**/*.{js,jsx}"],
    plugins: {
      import: importPlugin,
    },
    rules: {
      "import/order": [
        "warn",
        {
          groups: ["builtin", "external", "internal"],
          "newlines-between": "always",
        },
      ],
    },
  },
  {
    files: ["**/*.{js,jsx}", ...typescriptFiles],
    rules: prettier.rules,
  },
];
