// The staging build step (scripts/staging.mjs), run against a throwaway copy.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PAGES, readSite } from './helpers.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const copy = mkdtempSync(join(tmpdir(), 'whatishive-staging-'));
cpSync(join(root, 'site'), copy, { recursive: true });
execFileSync(process.execPath, [join(root, 'scripts', 'staging.mjs'), copy]);
const read = (path) => readFileSync(join(copy, path), 'utf8');

test.after(() => rmSync(copy, { recursive: true, force: true }));

test('staging blocks all crawlers', () => {
  assert.equal(read('robots.txt'), 'User-agent: *\nDisallow: /\n');
  assert.match(read('_headers'), /X-Robots-Tag: noindex, nofollow/);
});

for (const page of [...PAGES, '404.html']) {
  test(`staging: ${page} is noindex and shows the test-site banner`, () => {
    const html = read(page);
    assert.equal((html.match(/<meta name="robots"/g) ?? []).length, 1, 'exactly one robots meta tag');
    assert.match(html, /<meta name="robots" content="noindex, nofollow">/);
    assert.match(html, /<body>\s*<p class="staging-banner">/);
  });
}

test('the real site is untouched', () => {
  assert.doesNotMatch(readSite('robots.txt'), /Disallow: \//);
  assert.doesNotMatch(readSite('index.html'), /staging-banner/);
});
