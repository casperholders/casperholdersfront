module.exports = (on, config) => {
  // eslint-disable-next-line global-require
  require('@cypress/code-coverage/task')(on, config);
  return { ...config,
    fixturesFolder: 'tests/e2e/fixtures',
    integrationFolder: 'tests/e2e/specs',
    screenshotsFolder: 'tests/e2e/screenshots',
    videosFolder: 'tests/e2e/videos',
    supportFile: 'tests/e2e/support/index.js' };
};
