import path from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import stylisticPlugin from '@stylistic/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import jestPlugin from 'eslint-plugin-jest'
import prettierPluginRecommended from 'eslint-plugin-prettier/recommended'
import globals from 'globals'

// @see https://github.com/eslint/eslintrc?tab=readme-ov-file#usage-esm
// mimic CommonJS variables -- not needed if using CommonJS
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  resolvePluginsRelativeTo: __dirname,
})

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
  {
    ignores: ['index.js', 'lib/**/*.js'],
  },
  js.configs.recommended,
  prettierPluginRecommended,
  ...compat.extends(
    'plugin:import/errors',
    'plugin:import/typescript',
    'plugin:@typescript-eslint/recommended',
  ),
  ...compat.plugins('import'),
  {
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@stylistic': stylisticPlugin,
    },
    rules: {
      '@stylistic/explicit-module-boundary-types': 'off',
      '@stylistic/no-empty-function': 'off',
      '@stylistic/no-empty-interface': 'off',
      '@stylistic/no-trailing-spaces': 'error',
      'no-unused-vars': 'off',
      'sort-imports': 'off',
      'import/no-unresolved': 'error',
      'import/order': [
        'error',
        {
          alphabetize: {
            order: 'asc',
          },
        },
      ],
    },
    settings: {
      'import/resolver': {
        typescript: {},
      },
    },
  },
  {
    files: ['index.ts', 'lib/**/*.?(c|m){ts,tsx}'],

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    files: ['tests/**/*.?(c|m){ts,tsx}', 'jest.config.ts'],

    ...jestPlugin.configs['flat/recommended'],

    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      ...jestPlugin.configs['flat/recommended'].rules,
    },
  },
  {
    files: ['eslint.config.mjs'],

    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
]
