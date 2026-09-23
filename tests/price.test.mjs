// Unit tests for site/assets/price.js, with CoinGecko replaced by fakes so the
// suite never touches the network.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import {
  API_URL,
  COINGECKO_PAGE,
  fetchQuote,
  formatChange,
  formatPrice,
  parseQuote,
  render,
  start,
  trendOf,
} from '../site/assets/price.js';
import { loadPage } from './helpers.mjs';

const SAMPLE = { hive: { usd: 0.056501, usd_24h_change: 4.035077553400254, last_updated_at: 1790152770 } };

const ok = (body) => async () => ({ ok: true, status: 200, json: async () => body });
const status = (code) => async () => ({ ok: false, status: code, json: async () => ({}) });
const offline = async () => {
  throw new TypeError('Failed to fetch');
};

/** A fresh copy of the real #price block from index.html. */
function priceBlock() {
  const html = loadPage().getElementById('price').outerHTML;
  return parseHTML(`<!DOCTYPE html><html><body>${html}</body></html>`).document.getElementById('price');
}

const read = (root) => ({
  state: root.dataset.state,
  price: root.querySelector('[data-price]').textContent,
  change: root.querySelector('[data-change]').textContent,
  trend: root.querySelector('[data-change]').dataset.trend,
  status: root.querySelector('[data-status]').textContent,
});

test('asks CoinGecko for the HIVE price in USD with 24h change and timestamp', () => {
  const url = new URL(API_URL);
  assert.equal(url.origin, 'https://api.coingecko.com');
  assert.equal(url.searchParams.get('ids'), 'hive');
  assert.equal(url.searchParams.get('vs_currencies'), 'usd');
  assert.equal(url.searchParams.get('include_24hr_change'), 'true');
  assert.equal(url.searchParams.get('include_last_updated_at'), 'true');
});

test('parseQuote reads a normal response', () => {
  const quote = parseQuote(SAMPLE);
  assert.equal(quote.usd, 0.056501);
  assert.equal(quote.change24h, 4.035077553400254);
  assert.equal(quote.updatedAt.toISOString(), new Date(1790152770 * 1000).toISOString());
});

test('parseQuote rejects unusable responses', () => {
  for (const bad of [null, {}, { hive: {} }, { hive: { usd: 'n/a' } }, { hive: { usd: NaN } }, { hive: { usd: 0 } }, { error: 'rate limited' }]) {
    assert.equal(parseQuote(bad), null, JSON.stringify(bad));
  }
});

test('parseQuote tolerates a missing 24h change', () => {
  assert.equal(parseQuote({ hive: { usd: 0.05 } }).change24h, null);
});

test('formatPrice shows four decimals under $1 and two above', () => {
  assert.equal(formatPrice(0.056501), '$0.0565');
  assert.equal(formatPrice(0.05649), '$0.0565');
  assert.equal(formatPrice(0.9), '$0.9000');
  assert.equal(formatPrice(1.234), '$1.23');
  assert.equal(formatPrice(1234.5), '$1,234.50');
});

test('formatChange signs the percentage and uses a real minus sign', () => {
  assert.equal(formatChange(4.035077553400254), '+4.04%');
  assert.equal(formatChange(-1.234), '−1.23%');
  assert.equal(formatChange(0.001), '0.00%');
  assert.equal(formatChange(null), '–');
});

test('trendOf', () => {
  assert.equal(trendOf(2), 'up');
  assert.equal(trendOf(-2), 'down');
  assert.equal(trendOf(0.001), 'flat');
  assert.equal(trendOf(null), 'flat');
});

test('fetchQuote returns a quote on success', async () => {
  const quote = await fetchQuote(ok(SAMPLE));
  assert.equal(quote.usd, 0.056501);
});

test('fetchQuote throws on HTTP errors, bad payloads, and network failures', async () => {
  await assert.rejects(fetchQuote(status(429)), /429/);
  await assert.rejects(fetchQuote(ok({ hive: {} })), /Unexpected response/);
  await assert.rejects(fetchQuote(offline), /Failed to fetch/);
});

test('fetchQuote gives up after the timeout', async () => {
  const hangs = (_url, { signal }) =>
    new Promise((_, reject) => signal.addEventListener('abort', () => reject(new Error('aborted'))));
  await assert.rejects(fetchQuote(hangs, 20), /aborted/);
});

test('render: fresh quote shows price, change, trend, and an "as of" time', () => {
  const root = priceBlock();
  render(root, { quote: parseQuote(SAMPLE), failed: false }, 'en-US');
  const view = read(root);
  assert.equal(view.state, 'ok');
  assert.equal(view.price, '$0.0565');
  assert.equal(view.change, '+4.04%');
  assert.equal(view.trend, 'up');
  assert.match(view.status, /^As of \d{1,2}:\d{2}\s?[AP]M your time\. Updates every minute\.$/);
  assert.equal(root.querySelector('[data-status] time').getAttribute('datetime'), '2026-09-23T08:39:30.000Z');
});

test('render: a failed refresh keeps the last price and says it is stale', () => {
  const root = priceBlock();
  const quote = parseQuote(SAMPLE);
  render(root, { quote, failed: false }, 'en-US');
  render(root, { quote, failed: true }, 'en-US');
  const view = read(root);
  assert.equal(view.state, 'stale');
  assert.equal(view.price, '$0.0565');
  assert.match(view.status, /^Couldn’t refresh just now\. Showing the price as of /);
});

test('render: no price at all falls back to a CoinGecko link', () => {
  const root = priceBlock();
  render(root, { quote: null, failed: true }, 'en-US');
  const view = read(root);
  assert.equal(view.state, 'error');
  assert.equal(view.price, '–');
  assert.match(view.status, /isn’t available right now/);
  assert.equal(root.querySelector('[data-status] a').getAttribute('href'), COINGECKO_PAGE);
  assert.equal(root.querySelector('[data-status] a').getAttribute('target'), '_blank');
});

test('start: fetches immediately, then on each interval', async () => {
  const root = priceBlock();
  const doc = Object.assign(new EventTarget(), { hidden: false });
  let calls = 0;
  const counting = async (...args) => {
    calls += 1;
    return ok(SAMPLE)(...args);
  };
  const widget = start(root, { fetchImpl: counting, interval: 25, doc });
  try {
    await widget.ready;
    assert.equal(calls, 1);
    assert.equal(root.dataset.state, 'ok');
    await new Promise((resolve) => setTimeout(resolve, 70));
    assert.ok(calls >= 2, `expected a refresh, got ${calls} call(s)`);
  } finally {
    widget.stop();
  }
});

test('start: stops refreshing while the tab is hidden', async () => {
  const root = priceBlock();
  const doc = Object.assign(new EventTarget(), { hidden: false });
  let calls = 0;
  const counting = async (...args) => {
    calls += 1;
    return ok(SAMPLE)(...args);
  };
  const widget = start(root, { fetchImpl: counting, interval: 20, doc });
  try {
    await widget.ready;
    doc.hidden = true;
    doc.dispatchEvent(new Event('visibilitychange'));
    const before = calls;
    await new Promise((resolve) => setTimeout(resolve, 60));
    assert.equal(calls, before, 'kept fetching while hidden');
  } finally {
    widget.stop();
  }
});

test('start: a failing first fetch shows the fallback instead of throwing', async () => {
  const root = priceBlock();
  const doc = Object.assign(new EventTarget(), { hidden: false });
  const widget = start(root, { fetchImpl: offline, interval: 60_000, doc });
  try {
    await widget.ready;
    assert.equal(root.dataset.state, 'error');
  } finally {
    widget.stop();
  }
});
