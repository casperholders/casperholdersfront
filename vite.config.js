// vite.config.js
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import path from 'path';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import { VuetifyResolver } from 'unplugin-vue-components/resolvers';
import createComponentsPlugin from 'unplugin-vue-components/vite';
import { defineConfig } from 'vite';
import { createVuePlugin as vue } from 'vite-plugin-vue2';

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    global: 'globalThis',
  },
  plugins: [
    vue(),
    createComponentsPlugin({
      resolvers: [
        VuetifyResolver(),
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      process: 'process/browser',
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
