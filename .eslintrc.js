module.exports = {
  root: true,
  env: {
    es2021: true,
  },
  extends: [
    'plugin:vue/recommended',
    '@vue/airbnb',
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'import/order': ['off'], // See https://youtrack.jetbrains.com/issue/WEB-21182
    'import/extensions': ['error', 'always', {
      js: 'never',
      mjs: 'never',
      jsx: 'never',
      ts: 'never',
      tsx: 'never',
      vue: 'never',
    }],
    'import/no-extraneous-dependencies': ['error', {
      devDependencies: true,
    }],
    'class-methods-use-this': ['off'],
    'object-curly-newline': ['off'],
    'no-plusplus': ['off'],
  },
};
