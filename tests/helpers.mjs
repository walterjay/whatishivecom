// Shared helpers for the test suite. Tests read the files in site/ exactly as
// Netlify will publish them; there is no build step in between.

import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';

export const SITE_URL = 'https://whatishive.com/';
const SITE_DIR = new URL('../site/', import.meta.url);

export function readSite(path) {
  return readFileSync(new URL(path, SITE_DIR), 'utf8');
}

/** Pages Netlify publishes, as paths inside site/. */
export const PAGES = ['index.html', 'get-started/index.html'];

/** Does a site path like "/favicon.svg" or "/get-started/" resolve to a published file? */
export function siteFileExists(path) {
  const file = path.replace(/^\//, '').replace(/(^|\/)$/, '$1index.html');
  return existsSync(fileURLToPath(new URL(file, SITE_DIR)));
}

export function loadPage(path = 'index.html') {
  return parseHTML(readSite(path)).document;
}

/** Collapse whitespace and straighten typographic quotes so copy can be compared. */
export function normalize(text) {
  return text
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

export function textOf(node) {
  return node ? normalize(node.textContent) : '';
}

/** All JSON-LD nodes on the page, with any @graph flattened. */
export function structuredData(doc) {
  return [...doc.querySelectorAll('script[type="application/ld+json"]')].flatMap((script) => {
    const data = JSON.parse(script.textContent);
    return data['@graph'] ?? [data];
  });
}

/** The visible FAQ as [{ question, answer }], in page order. */
export function visibleFaq(doc) {
  return [...doc.querySelectorAll('#faq .faq-item')].map((item) => ({
    question: textOf(item.querySelector('h3')),
    answer: [...item.querySelectorAll('p')].map(textOf).join(' '),
  }));
}

/**
 * Visible text of <main> with the given selectors removed, so rules can be
 * applied to "the body copy" separately from, say, the FAQ.
 */
export function mainTextWithout(doc, ...selectors) {
  const main = doc.querySelector('main').cloneNode(true);
  for (const selector of selectors) {
    for (const node of main.querySelectorAll(selector)) node.remove();
  }
  return textOf(main);
}

/** Count sentences, ignoring dots inside names like "Hive.com" or "Inc." followed by lowercase. */
export function countSentences(text) {
  return (normalize(text).match(/[.!?]["')]?(?=\s+["(]?[A-Z]|\s*$)/g) ?? []).length;
}
