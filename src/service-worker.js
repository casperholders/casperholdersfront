// eslint-disable-next-line no-undef
if (workbox) {
  console.log('Workbox is loaded');
  // eslint-disable-next-line no-restricted-globals
  self.skipWaiting();

  // eslint-disable-next-line no-undef,no-restricted-globals,no-underscore-dangle
  workbox.precaching.precacheAndRoute(self.__precacheManifest);

  // eslint-disable-next-line no-undef,no-restricted-globals,no-underscore-dangle
  workbox.routing.registerNavigationRoute(workbox.precaching.getCacheKeyForURL('index.html'));
  // eslint-disable-next-line no-undef
  workbox.routing.registerRoute(
    new RegExp(/\.(?:jpg|webp|mp4|woff2|jpeg|png|gif|ico|css|html|md)$/),
    // eslint-disable-next-line no-undef
    new workbox.strategies.StaleWhileRevalidate(),
  );
  // eslint-disable-next-line no-undef
  workbox.routing.setDefaultHandler(new workbox.strategies.NetworkFirst());
} else {
  console.log('Workbox didn\'t load');
}
