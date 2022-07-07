const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    devServer: {
      framework: "vue",
      bundler: "vite",
    },
    supportFile: "tests/e2e/support/index.js",
    specPattern: "tests/e2e/specs/**/*.js",
    setupNodeEvents(on, config) {
      require('@cypress/code-coverage/task')(on, config)
      return config
    }
  },
});
