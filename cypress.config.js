const { defineConfig } = require('cypress');

module.exports = defineConfig({
  projectId: 'casperholdersfront',
  e2e: {
    devServer: {
      framework: 'vue',
      bundler: 'vite',
    },
    video: false,
    supportFile: 'tests/e2e/support/index.js',
    fixturesFolder: 'tests/e2e/fixtures/',
    specPattern: 'tests/e2e/specs/**/*.js',
    setupNodeEvents(on, config) {
      require('@cypress/code-coverage/task')(on, config);
      return config;
    },
  },
});
