module.exports = {
  root: true,
  env: {
    es2021: true,
  },
  extends: [
    'airbnb-base',
    'plugin:vue/recommended',
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'import/order': ['off'], // See https://youtrack.jetbrains.com/issue/WEB-21182
    'import/no-unresolved': ['off'],
    'import/extensions': ['off'],
    'import/no-extraneous-dependencies': ['error', {
      devDependencies: true,
    }],
    'class-methods-use-this': ['off'],
    'object-curly-newline': ['off'],
    'no-plusplus': ['off'],
    'vue/match-component-file-name': ['error', {
      extensions: ['vue'],
      shouldMatchCase: true,
    }],
  },
};
