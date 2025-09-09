module.exports = {
  extends: ['expo', 'prettier', 'plugin:@tanstack/query/recommended'],
  plugins: ['prettier', 'simple-import-sort'],
  ignorePatterns: ['expo-env.d.ts'],
  rules: {
    'import/no-unresolved': 'off',
    'prettier/prettier': 'error',
    'simple-import-sort/imports': 'warn',
    'simple-import-sort/exports': 'warn',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        caughtErrors: 'all',
        caughtErrorsIgnorePattern: '^_'
      }
    ]
  }
}
