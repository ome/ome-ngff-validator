import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

let config = {
  plugins: [svelte()],

  // https://stackoverflow.com/questions/75576741/how-to-solve-error-big-integer-literals-are-not-available-in-the-configured-tar
  build: {
    target: 'esnext', // you can also use 'es2020' here
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext', // you can also use 'es2020' here
    },
  },
};
// this will be undefined when deployed from netlify, but is used by gh-pages
if (process.env.GITHUB_REPOSITORY_OWNER) {
  config.base = `https://${process.env.GITHUB_REPOSITORY_OWNER}.github.io/ome-ngff-validator/`;
}

export default defineConfig(config);
