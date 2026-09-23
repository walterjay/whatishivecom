// Search and AI-answer-engine plumbing: meta tags, JSON-LD, robots.txt,
// sitemap.xml, and llms.txt.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PAGES, SITE_URL, loadPage, readSite, siteFileExists, structuredData, visibleFaq } from './helpers.mjs';

const doc = loadPage();
const meta = (selector) => doc.querySelector(selector)?.getAttribute('content');

test('title is descriptive, names the search terms, and is a sensible length', () => {
  const title = doc.querySelector('title').textContent;
  assert.match(title, /What is Hive\?/);
  assert.match(title, /Hive blockchain/);
  assert.ok(title.length <= 65, `title is ${title.length} characters`);
});

test('the page answers to "Hive chain" as well as "Hive blockchain"', () => {
  const term = structuredData(doc).find((node) => node['@type'] === 'DefinedTerm');
  assert.ok(term.alternateName.includes('Hive chain'));
  assert.ok(term.alternateName.includes('Hive blockchain'));
  assert.match(visibleFaq(doc)[0].answer, /Hive chain/);
});

test('meta description fits in a search result', () => {
  const description = meta('meta[name="description"]');
  assert.ok(description, 'missing meta description');
  assert.ok(description.length >= 70 && description.length <= 160, `description is ${description.length} characters`);
});

test('canonical URL is the site root', () => {
  assert.equal(doc.querySelector('link[rel="canonical"]').getAttribute('href'), SITE_URL);
});

test('page is indexable', () => {
  assert.doesNotMatch(meta('meta[name="robots"]') ?? '', /noindex|nofollow/);
});

test('Open Graph tags are complete', () => {
  for (const property of ['og:type', 'og:site_name', 'og:title', 'og:description', 'og:url', 'og:image', 'og:image:alt']) {
    assert.ok(meta(`meta[property="${property}"]`), `missing ${property}`);
  }
  assert.equal(meta('meta[property="og:url"]'), SITE_URL);
});

test('Twitter card tags are complete', () => {
  assert.equal(meta('meta[name="twitter:card"]'), 'summary_large_image');
  for (const name of ['twitter:title', 'twitter:description', 'twitter:image', 'twitter:image:alt']) {
    assert.ok(meta(`meta[name="${name}"]`), `missing ${name}`);
  }
});

test('social image URLs are absolute and the image is published', () => {
  for (const url of [meta('meta[property="og:image"]'), meta('meta[name="twitter:image"]')]) {
    assert.ok(url.startsWith(SITE_URL), `${url} is not an absolute whatishive.com URL`);
    assert.ok(siteFileExists(new URL(url).pathname), `${url} is not in site/`);
  }
});

test('JSON-LD parses and defines Hive as the subject of the page', () => {
  const nodes = structuredData(doc);
  const term = nodes.find((node) => node['@type'] === 'DefinedTerm');
  assert.ok(term, 'no DefinedTerm');
  assert.equal(term.name, 'Hive');
  assert.ok(term.description.length > 100);
  assert.ok(term.sameAs.includes('https://hive.io/'));

  const page = nodes.find((node) => node['@type'] === 'WebPage');
  assert.equal(page.about['@id'], term['@id']);
});

test('FAQPage JSON-LD matches the visible FAQ word for word', () => {
  const faq = structuredData(doc).find((node) => node['@type'] === 'FAQPage');
  assert.ok(faq, 'no FAQPage');
  const marked = faq.mainEntity.map((q) => ({ question: q.name, answer: q.acceptedAnswer.text }));
  const visible = visibleFaq(doc);
  assert.equal(marked.length, visible.length, 'different number of questions');
  marked.forEach((item, i) => {
    assert.equal(item.question.replace(/’/g, "'"), visible[i].question, `question ${i + 1}`);
    assert.equal(item.answer.replace(/’/g, "'"), visible[i].answer, `answer to "${visible[i].question}"`);
  });
});

test('robots.txt explicitly allows search engines and AI crawlers', () => {
  const robots = readSite('robots.txt');
  assert.doesNotMatch(robots, /^Disallow:\s*\/\s*$/m, 'something is blocked from the whole site');
  const groups = robots.split(/\n\s*\n/).filter((block) => /User-agent:/i.test(block));
  const allowedAgents = groups
    .filter((block) => /^Allow:\s*\/\s*$/m.test(block))
    .flatMap((block) => [...block.matchAll(/^User-agent:\s*(\S+)/gim)].map((m) => m[1].toLowerCase()));
  for (const bot of ['*', 'Googlebot', 'Bingbot', 'GPTBot', 'PerplexityBot', 'ClaudeBot', 'Google-Extended', 'CCBot']) {
    assert.ok(allowedAgents.includes(bot.toLowerCase()), `${bot} is not explicitly allowed`);
  }
  assert.match(robots, new RegExp(`^Sitemap: ${SITE_URL}sitemap\\.xml$`, 'm'));
});

test('sitemap.xml lists every page, and nothing else', () => {
  const sitemap = readSite('sitemap.xml');
  assert.match(sitemap, /^<\?xml version="1\.0" encoding="UTF-8"\?>/);
  assert.match(sitemap, /xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9"/);
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const canonicals = PAGES.map((page) => loadPage(page).querySelector('link[rel="canonical"]').getAttribute('href'));
  assert.deepEqual(locs.sort(), canonicals.sort());
  assert.equal((sitemap.match(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g) ?? []).length, locs.length);
});

test('llms.txt follows the llms.txt format and covers the essentials', () => {
  const llms = readSite('llms.txt');
  assert.match(llms, /^# .+\n\n> .+/, 'should open with an H1 title and a blockquote summary');
  assert.match(llms, /^## FAQ$/m);
  assert.match(llms, /^## Links$/m);
  for (const fact of [/blockchain/, /March 2020/, /HBD/, /three seconds/, /Hive\.com/, /Apache Hive/, /Steem/]) {
    assert.match(llms, fact);
  }
  for (const [, url] of llms.matchAll(/\]\((\S+?)\)/g)) assert.match(url, /^https:\/\//, url);
});

test('the page advertises llms.txt', () => {
  assert.ok(doc.querySelector('link[rel="alternate"][href="/llms.txt"]'));
});

// The beginner sign-up guide at /get-started/.
const guide = loadPage('get-started/index.html');
const guideMeta = (selector) => guide.querySelector(selector)?.getAttribute('content');

test('get-started: title and description target "how to create a Hive account"', () => {
  const title = guide.querySelector('title').textContent;
  assert.match(title, /create a Hive account/i);
  assert.ok(title.length <= 65, `title is ${title.length} characters`);
  const description = guideMeta('meta[name="description"]');
  assert.ok(description.length >= 70 && description.length <= 160, `description is ${description.length} characters`);
});

test('get-started: canonical, Open Graph, and Twitter tags point at the guide', () => {
  const url = `${SITE_URL}get-started/`;
  assert.equal(guide.querySelector('link[rel="canonical"]').getAttribute('href'), url);
  assert.equal(guideMeta('meta[property="og:url"]'), url);
  assert.equal(guideMeta('meta[name="twitter:card"]'), 'summary_large_image');
  assert.ok(siteFileExists(new URL(guideMeta('meta[property="og:image"]')).pathname));
});

test('get-started: HowTo steps match the numbered steps on the page', () => {
  const howTo = structuredData(guide).find((node) => node['@type'] === 'HowTo');
  assert.ok(howTo, 'no HowTo');
  const visible = [...guide.querySelectorAll('.steps > li')];
  assert.equal(howTo.step.length, visible.length);
  howTo.step.forEach((step, i) => {
    assert.equal(step.name, visible[i].querySelector('h3').textContent.replace(/ \(.*\)$/, ''));
    assert.equal(step.url, `${SITE_URL}get-started/#${visible[i].id}`);
  });
});

test('get-started: breadcrumb leads back to the home page', () => {
  const crumbs = structuredData(guide).find((node) => node['@type'] === 'BreadcrumbList');
  assert.equal(crumbs.itemListElement[0].item, SITE_URL);
  assert.ok(guide.querySelector('.breadcrumb a[href="/"]'));
});
