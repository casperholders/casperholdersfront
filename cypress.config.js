const { defineConfig } = require('cypress');

module.exports = defineConfig({
  projectId: 'casperholdersfront',
  env: {
    browserPermissions: {
      clipboard: 'allow',
    },
  },
  e2e: {
    devServer: {
      framework: 'vue',
      bundler: 'vite',
    },
    video: false,
    viewportWidth: 1920,
    viewportHeight: 1080,
    supportFile: 'tests/e2e/support/index.js',
    fixturesFolder: 'tests/e2e/fixtures/',
    downloadsFolder: 'tests/e2e/fixtures/downloads/',
    specPattern: 'tests/e2e/specs/**/*.js',
    setupNodeEvents(on, config) {
      require('@cypress/code-coverage/task')(on, config);
      return config;
    },
  },
});
