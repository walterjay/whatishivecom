// Turns a published copy of site/ into the staging site (new.whatishive.com).
// Netlify runs this only for the `new` branch (see netlify.toml), on its own
// build copy; the files in the repository are never changed.
//
//   node scripts/staging.mjs [dir]   (default: site)

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.argv[2] ?? 'site';

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
