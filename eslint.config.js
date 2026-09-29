// @ts-check
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import eslintPluginAstro from 'eslint-plugin-astro';

export default tseslint.config(
  {
    ignores: ['dist/', 'dist-*/', '.astro/', 'node_modules/', 'example-content/', 'design/'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  {
    files: ['**/*.astro'],
    rules: {
      // Astro components commonly declare props/types unused by the template body.
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
);
