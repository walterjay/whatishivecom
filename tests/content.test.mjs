// The voice and language rules from the content brief, enforced as tests so
// future edits can't quietly drift into jargon or hype.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { countSentences, loadPage, mainTextWithout, readSite, structuredData, textOf, visibleFaq } from './helpers.mjs';

const doc = loadPage();
const hero = textOf(doc.getElementById('hero'));
const bodyCopy = mainTextWithout(doc, '#faq');
const everything = textOf(doc.documentElement) + ' ' + readSite('llms.txt');

// Words the main body must not use. The FAQ is exempt: it's where the
// technical explanation is supposed to live.
const JARGON = [
  /\bDPoS\b/i,
  /\bconsensus\b/i,
  /\bwitness(es)?\b/i,
  /\bfork(s|ed|ing)?\b/i,
  /\bwallet address(es)?\b/i,
  /\bdecentrali[sz]\w*/i,
  /\bdapps?\b/i,
  /\bweb3\b/i,
  /\btokenomics\b/i,
  /\bstaking\b/i,
  /\bsmart contracts?\b/i,
  /\bpeer-to-peer\b/i,
  /\bcensorship-resistant\b/i,
];

// Words that don't belong anywhere on an honest explainer.
const HYPE = [
  /\brevolutionary\b/i,
  /\brevolutioni[sz]e\w*/i,
  /\bnext big thing\b/i,
  /\bgame[- ]chang\w*/i,
  /\bdisrupt\w*/i,
  /\bto the moon\b/i,
  /\bget rich\b/i,
  /\bguaranteed (returns?|profits?)\b/i,
  /\bpassive income\b/i,
  /\bdon'?t miss out\b/i,
];

test('the hero never says "blockchain"', () => {
  assert.doesNotMatch(hero, /blockchain/i);
});

test('"blockchain" appears at most once in the body copy (outside the FAQ)', () => {
  // A company's former name isn't an explanation of Hive, so it doesn't count.
  const count = (bodyCopy.replace(/HIVE Blockchain Technologies/g, '').match(/blockchain/gi) ?? []).length;
  assert.ok(count <= 1, `found ${count} mentions outside the FAQ`);
});

test('the FAQ carries the full blockchain explanation', () => {
  const technical = visibleFaq(doc).find((item) => /technically/i.test(item.question));
  assert.ok(technical, 'no "What is Hive, technically?" question');
  assert.match(technical.answer, /blockchain/i);
  for (const fact of [/2020/, /HBD/, /three seconds|3 seconds/i, /no fees|fee-less|free/i, /witness/i]) {
    assert.match(technical.answer, fact);
  }
});

for (const word of JARGON) {
  test(`body copy avoids jargon: ${word.source}`, () => {
    assert.doesNotMatch(bodyCopy, word);
  });
}

for (const word of HYPE) {
  test(`no hype anywhere: ${word.source}`, () => {
    assert.doesNotMatch(everything, word);
  });
}

test('the hero rules out the most confusable namesakes and links to the full list', () => {
  assert.match(hero, /HIVE Digital Technologies/);
  assert.match(hero, /Hive\.com/);
  assert.ok(doc.querySelector('#hero a[href="#other-hives"]'), 'hero should link to #other-hives');
});

test('"Other things called Hive" lists the common namesakes', () => {
  const names = [...doc.querySelectorAll('#other-hives dt')].map(textOf);
  assert.ok(names.length >= 5 && names.length <= 8, `${names.length} entries`);
  for (const expected of [/HIVE Digital/, /Hive\.com/, /Apache Hive/, /Hive Social/]) {
    assert.ok(names.some((name) => expected.test(name)), `missing ${expected}`);
  }
  for (const entry of doc.querySelectorAll('#other-hives dd')) {
    assert.ok(textOf(entry).length > 20, 'each namesake needs a short description');
  }
});

test('the hero subhead names Hive in one sentence', () => {
  const lede = textOf(doc.querySelector('.hero-lede'));
  assert.match(lede, /^Hive\b/);
  assert.equal(countSentences(lede), 1);
});

test('"What Hive actually is" stays short: 2–3 sentences', () => {
  const lead = textOf(doc.querySelector('#what .lead'));
  const n = countSentences(lead);
  assert.ok(n >= 2 && n <= 3, `${n} sentences`);
});

test('real examples are named', () => {
  for (const name of ['PeakD', 'Ecency', 'Splinterlands']) assert.match(bodyCopy, new RegExp(name));
});

test('the FAQ answers every question in the brief', () => {
  const questions = visibleFaq(doc).map((item) => item.question);
  for (const expected of [
    /technically/i,
    /Hive\.com/,
    /scam/i,
    /get started/i,
    /bank|social media/i,
    /Steem/,
  ]) {
    assert.ok(questions.some((q) => expected.test(q)), `no FAQ question matching ${expected}`);
  }
});

test('every FAQ answer is 1–3 sentences', () => {
  for (const { question, answer } of visibleFaq(doc)) {
    const n = countSentences(answer);
    assert.ok(n >= 1 && n <= 3, `"${question}" has ${n} sentences`);
  }
});

test('the "last reviewed" date agrees everywhere it appears', () => {
  const footerDate = doc.querySelector('footer time').getAttribute('datetime');
  const page = structuredData(doc).find((node) => node['@type'] === 'WebPage');
  assert.equal(page.dateModified, footerDate, 'JSON-LD dateModified');
  assert.match(readSite('sitemap.xml'), new RegExp(`<lastmod>${footerDate}</lastmod>`), 'sitemap.xml lastmod');
  assert.match(readSite('llms.txt'), new RegExp(`Last reviewed: ${footerDate}`), 'llms.txt');
});
