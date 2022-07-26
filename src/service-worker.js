import { createHandlerBoundToURL, precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute, setDefaultHandler, NavigationRoute } from 'workbox-routing';
import { NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { clientsClaim } from 'workbox-core';

// eslint-disable-next-line no-undef
try {
  console.log('Workbox is loaded');
  // eslint-disable-next-line no-restricted-globals
  self.skipWaiting();
  clientsClaim();
  // eslint-disable-next-line no-undef,no-restricted-globals,no-underscore-dangle
  precacheAndRoute(self.__WB_MANIFEST);
  registerRoute(new NavigationRoute(
    createHandlerBoundToURL('index.html'),
  ));
  cleanupOutdatedCaches();
  // eslint-disable-next-line no-undef,no-restricted-globals,no-underscore-dangle
  // registerNavigationRoute(getCacheKeyForURL('index.html'));
  // eslint-disable-next-line no-undef
  registerRoute(
    /\.(?:jpg|webp|mp4|woff2|jpeg|png|gif|ico|css|html|md)$/,
    // eslint-disable-next-line no-undef
    new StaleWhileRevalidate(),
  );
  // eslint-disable-next-line no-undef
  setDefaultHandler(new NetworkFirst());
} catch (e) {
  console.log(e);
  console.log('Workbox didn\'t load');
}
