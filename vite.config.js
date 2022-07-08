// vite.config.js
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import path from 'path';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import { VuetifyResolver } from 'unplugin-vue-components/resolvers';
import createComponentsPlugin from 'unplugin-vue-components/vite';
import { defineConfig } from 'vite';
import mkcert from 'vite-plugin-mkcert'
import { VitePWA } from 'vite-plugin-pwa';
import { createVuePlugin as vue } from 'vite-plugin-vue2';

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    global: 'globalThis',
  },
  server: {
    https: false
  },
  open: true,
  port: 3001,
  plugins: [
    vue(),
    createComponentsPlugin({
      resolvers: [
        VuetifyResolver(),
      ],
    }),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'service-worker.js',
      includeAssets: ['img/icons/favicon.ico', 'img/icons/apple-touch-icon-180x180.png', 'img/icons/safari-pinned-tab.svg'],
      manifest: {
        name: 'Casper Holders',
        short_name: 'CasperHolders',
        description: 'Interact with the Casper Blockchain',
        theme_color: '#00126b',
        icons: [
          {
            src: 'img/icons/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'img/icons/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'img/icons/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    }),
    mkcert(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
  },
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis',
      },
      // Enable esbuild polyfill plugins
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
        }),
      ],
    },
  },
  build: {
    rollupOptions: {
      plugins: [nodePolyfills()],
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    sourcemap: true,
  },
  css: {
    preprocessorOptions: {
      sass: { additionalData: '@import "@/scss/variables.scss"\n' },
    },
  },
});
