module.exports = {
  root: true,
  extends: ['universe/native', 'universe/web'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react-native'],
  rules: {
    '@typescript-eslint/no-empty-object-type': 'off',
    '@typescript-eslint/no-wrapper-object-types': 'off',
    'react-native/no-inline-styles': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-throw-literal': 'warn',
  },
  ignorePatterns: ['build', 'node_modules'],
  settings: {
    'react-native/style-sheet-object-names': [
      'StyleSheet',
      'OtherStyleSheet',
      'PStyleSheet',
    ],
  },
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
};
