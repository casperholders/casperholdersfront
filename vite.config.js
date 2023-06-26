// vite.config.js
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import vue from '@vitejs/plugin-vue2';
import path from 'path';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import visualizer from 'rollup-plugin-visualizer';
import { VuetifyResolver } from 'unplugin-vue-components/resolvers';
import createComponentsPlugin from 'unplugin-vue-components/vite';
import { defineConfig, loadEnv } from 'vite';
import mkcert from 'vite-plugin-mkcert';
import { VitePWA } from 'vite-plugin-pwa';

/**
 * Replace env variables in index.html
 * @see https://github.com/vitejs/vite/issues/3105#issuecomment-939703781
 * @see https://vitejs.dev/guide/api-plugin.html#transformindexhtml
 */
function htmlPlugin(env) {
  return {
    name: 'html-transform',
    transformIndexHtml: {
      enforce: 'pre',
      transform: (html) => html.replace(/%(.*?)%/g, (match, p1) => env[p1] ?? match),
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  define: {
    global: 'globalThis',
  },
  server: {
    https: false,
  },
  open: true,
  port: 3001,
  plugins: [
    visualizer(),
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
        name: 'Div3',
        short_name: 'Div3',
        description: 'Interact with the Casper Blockchain',
        theme_color: '#00126b',
        icons: [
          {
            src: 'img/icons/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'img/icons/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'img/icons/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
    mkcert(),
    htmlPlugin(loadEnv(mode, '.')),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'readable-stream': 'vite-compatible-readable-stream',
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
        NodeModulesPolyfillPlugin(),
        NodeGlobalsPolyfillPlugin({
          buffer: true,
        }),
        {
          name: 'fix-node-globals-polyfill', // FIXME https://github.com/remorses/esbuild-plugins/issues/24
          setup(build) {
            build.onResolve(
              { filter: /(_virtual-process-polyfill_|_buffer)\.js/ },
              ({ path }) => ({ path }),
            );
          },
        },
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
}));
