/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'simple-import-sort'],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended', // run Prettier as an ESLint rule
  ],
  settings: {
    react: { version: 'detect' },
    // Make ESLint understand tsconfig `paths` like "@/..."
    'import/resolver': {
      typescript: {}, // requires `eslint-import-resolver-typescript`
    },
  },
  env: {
    browser: true,
    es2021: true,
  },
  parserOptions: {
    ecmaFeatures: { jsx: true },
    sourceType: 'module',
  },
  rules: {
    // --- Import sorting (auto-fixable) ---
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',

    // --- Best practices and your existing rules ---
    eqeqeq: 'error',
    curly: 'error',
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-unused-vars': 'warn',
    'no-console': 'warn',
    'no-var': 'error',
    'prefer-const': 'error',
    'no-duplicate-imports': 'error',

    // React / Hooks
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx', '.ts', '.tsx'] }],

    // TypeScript
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',

    // --- Optional: encourage absolute imports (@/...) over deep relatives ---
    // Adjust patterns to your taste; these WARN on deeply nested relatives.
    'no-restricted-imports': [
      'warn',
      {
        patterns: ['../../*', '../../../*', '../../../../*'],
      },
    ],
  },

  // Ignore linting for shadcn UI components during prototyping to avoid noise
  ignorePatterns: ['src/components/ui/**', 'src/components/ui/use-toast.ts'],
};
