// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      'no-console': 'warn',
    },
  },
  {
    // ビルド済みファイルやキャッシュを対象外にする設定
    ignores: ['dist/', 'node_modules/', 'pwa-assets-config.ts']
  }
);