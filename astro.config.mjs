// @ts-check
import { defineConfig } from 'astro/config';

const site = process.env.SITE_URL;
const isBuild = process.argv.includes('build');

// Link previews need absolute image URLs, so a build without a public base URL is an error (R12).
if (isBuild && !site) {
  throw new Error('SITE_URL must be set for production builds');
}

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
});
