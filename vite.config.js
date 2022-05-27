// vite.config.js
let config = {};
// this will be undefined when deployed from netlify, but is used by gh-pages
if (process.env.GITHUB_REPOSITORY_OWNER) {
  config.base = `https://${process.env.GITHUB_REPOSITORY_OWNER}.github.io/ome-ngff-validator/`;
}

export default config;
