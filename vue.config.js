module.exports = {
  transpileDependencies: [
    'vuetify',
  ],
  pwa: {
    name: 'CasperHolders - Interact with the Casper Blockchain.',
    themeColor: '#00126b',
    msTileColor: '#00126b',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: '#00126b',
    manifestOptions: {
      short_name: 'CasperHolders',
      background_color: '#00126b',
    },
    workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      swSrc: 'src/service-worker.js',
    },
  },
};
