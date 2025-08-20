import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import prettier from 'eslint-config-prettier';

export default [
  // Ignore patterns
  {
    ignores: ['dist', 'src/components/ui/**', 'src/components/ui/use-toast.ts'],
  },

  // Base JS recommended (flat-ready)
  js.configs.recommended,

  // TypeScript recommended (array of flat configs)
  ...tseslint.configs.recommended,

  // Prettier: disable conflicting stylistic rules
  prettier,

  // Project rules
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        window: 'readonly',
        document: 'readonly',
      },
      // NOTE: ecmaFeatures was removed in ESLint v9 flat config. JSX is handled by parser + file extensions.
      // If you have .jsx/.tsx files, parsing JSX will work without ecmaFeatures.
    },
    settings: {
      react: { version: 'detect' },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      // React + Hooks recommended rules (pull .rules explicitly for flat config)
      ...react.configs.recommended?.rules,
      ...reactHooks.configs.recommended?.rules,

      // React Refresh (Vite/fast-refresh)
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // Simple import sort
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',

      // TypeScript-specific tweaks
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',

      // Restrict fragile relative-up imports
      'no-restricted-imports': ['warn', { patterns: ['../../*', '../../../*', '../../../../*'] }],
    },
  },
];
