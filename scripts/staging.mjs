// Turns a published copy of site/ into the staging site (new.whatishive.com).
// Netlify runs it after the tests on every deploy (see netlify.toml), but it
// only does anything when the branch being built is `new`. Netlify sets
// BRANCH during builds, so this works whether `new` is built as a branch
// deploy of the main project or as the production branch of a separate
// staging project. It edits Netlify's build copy; the repository is never
// changed.
//
//   node scripts/staging.mjs [dir] [--force]   (default dir: site)

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export const STAGING_BRANCH = 'new';

const args = process.argv.slice(2);
const dir = args.find((arg) => !arg.startsWith('--')) ?? 'site';

if (process.env.BRANCH !== STAGING_BRANCH && !args.includes('--force')) {
  console.log(`Staging: branch is "${process.env.BRANCH ?? 'unknown'}", not "${STAGING_BRANCH}"; leaving the site as it is.`);
  process.exit(0);
}

const BANNER =
  '<p class="staging-banner">Test site: changes here are not live yet. ' +
  '<a href="https://whatishive.com/">Go to whatishive.com</a></p>';

// Keep the test site out of search results so it never competes with the real one.
writeFileSync(join(dir, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
writeFileSync(join(dir, '_headers'), '/*\n  X-Robots-Tag: noindex, nofollow\n');

for (const entry of readdirSync(dir, { recursive: true })) {
  if (!entry.endsWith('.html')) continue;
  const file = join(dir, entry);
  let html = readFileSync(file, 'utf8');
  html = html.replace(/<meta name="robots"[^>]*>/, '');
  html = html.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n  <meta name="robots" content="noindex, nofollow">');
  html = html.replace(/<body>/, `<body>\n  ${BANNER}`);
  writeFileSync(file, html);
}

console.log(`Staging: ${dir} marked noindex and bannered.`);
