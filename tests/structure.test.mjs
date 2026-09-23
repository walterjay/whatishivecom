// Page structure: headings, landmarks, links, and assets.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PAGES, loadPage, siteFileExists, textOf } from './helpers.mjs';

const doc = loadPage();

for (const page of PAGES) {
  const doc = loadPage(page);

  test(`${page}: has exactly one h1, and it names Hive`, () => {
    const h1s = doc.querySelectorAll('h1');
    assert.equal(h1s.length, 1);
    assert.match(textOf(h1s[0]), /Hive/);
  });

  test(`${page}: heading levels never skip (h1 → h2 → h3)`, () => {
    let previous = 0;
    for (const heading of doc.querySelectorAll('h1, h2, h3, h4, h5, h6')) {
      const level = Number(heading.tagName[1]);
      assert.ok(level <= previous + 1, `"${textOf(heading)}" jumps from h${previous} to h${level}`);
      previous = level;
    }
  });

  test(`${page}: every section is labelled by its own heading`, () => {
    for (const section of doc.querySelectorAll('main > section')) {
      const id = section.getAttribute('aria-labelledby');
      assert.ok(id, `section #${section.id} has no aria-labelledby`);
      const label = doc.getElementById(id);
      assert.ok(label, `section #${section.id} points at missing #${id}`);
      assert.match(label.tagName, /^H[1-3]$/, `section #${section.id} is labelled by a <${label.tagName}>`);
    }
  });

  test(`${page}: ids are unique`, () => {
    const ids = [...doc.querySelectorAll('[id]')].map((el) => el.id);
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    assert.deepEqual(dupes, []);
  });

  test(`${page}: in-page links point at ids that exist`, () => {
    for (const link of doc.querySelectorAll('a[href^="#"]')) {
      const target = link.getAttribute('href').slice(1);
      assert.ok(doc.getElementById(target), `link to #${target} has no target`);
    }
  });

  test(`${page}: local files referenced by the page exist`, () => {
    const refs = [...doc.querySelectorAll('[href], [src]')]
      .map((el) => el.getAttribute('href') ?? el.getAttribute('src'))
      .filter((ref) => ref.startsWith('/') && !ref.startsWith('//'))
      .map((ref) => ref.split(/[?#]/)[0])
      .filter((ref) => ref !== '/');
    assert.ok(refs.length > 0);
    for (const ref of refs) assert.ok(siteFileExists(ref), `${ref} is referenced but missing from site/`);
  });

  test(`${page}: external links use https`, () => {
    for (const link of doc.querySelectorAll('a[href^="http"]')) {
      assert.match(link.getAttribute('href'), /^https:\/\//, link.getAttribute('href'));
    }
  });

  test(`${page}: no render-blocking scripts, and no inline scripts other than JSON-LD`, () => {
    for (const script of doc.querySelectorAll('script')) {
      const type = script.getAttribute('type');
      if (type === 'application/ld+json') continue;
      assert.ok(script.hasAttribute('src'), 'inline <script> found (would also break the Content-Security-Policy)');
      assert.ok(
        type === 'module' || script.hasAttribute('defer') || script.hasAttribute('async'),
        `${script.getAttribute('src')} blocks rendering`,
      );
    }
  });

  test(`${page}: no inline style attributes (the Content-Security-Policy forbids them)`, () => {
    assert.equal(doc.querySelectorAll('[style]').length, 0);
  });

  test(`${page}: document basics: language, viewport, charset`, () => {
    assert.equal(doc.documentElement.getAttribute('lang'), 'en');
    assert.ok(doc.querySelector('meta[charset="utf-8"]'));
    assert.match(doc.querySelector('meta[name="viewport"]').getAttribute('content'), /width=device-width/);
  });
}

test('sections appear in the order of the content brief', () => {
  const order = [...doc.querySelectorAll('main > section')].map((section) => section.id);
  assert.deepEqual(order, ['hero', 'what', 'communities', 'payments', 'more', 'price', 'faq', 'other-hives', 'links']);
});

test('the price block has everything price.js looks for', () => {
  const block = doc.getElementById('price');
  assert.ok(block);
  for (const hook of ['[data-price]', '[data-change]', '[data-status]']) {
    assert.ok(block.querySelector(hook), `#price is missing ${hook}`);
  }
  assert.ok(block.querySelector('noscript'), 'no fallback for visitors without JavaScript');
});

test('404 page exists, links home, and is not indexed', () => {
  const notFound = loadPage('404.html');
  assert.equal(notFound.querySelector('meta[name="robots"]').getAttribute('content'), 'noindex');
  assert.ok(notFound.querySelector('a[href="/"]'));
});
