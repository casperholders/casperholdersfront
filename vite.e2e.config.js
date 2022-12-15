// vite.config.js
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import vue from '@vitejs/plugin-vue2';
import path from 'path';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import { VuetifyResolver } from 'unplugin-vue-components/resolvers';
import createComponentsPlugin from 'unplugin-vue-components/vite';
import { defineConfig, loadEnv } from 'vite';
import istanbul from 'vite-plugin-istanbul';

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
    vue(),
    createComponentsPlugin({
      resolvers: [
        VuetifyResolver(),
      ],
    }),
    istanbul({
      include: 'src/*',
      exclude: ['node_modules', 'tests/'],
      extension: ['.js', '.ts', '.vue'],
      forceBuildInstrument: true,
    }),
    htmlPlugin(loadEnv(mode, '.')),
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
}));
