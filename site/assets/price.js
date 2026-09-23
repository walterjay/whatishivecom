// Live HIVE price for the "HIVE price right now" block.
//
// Loaded as a module, so it is deferred and never blocks rendering. The pure
// helpers are exported so tests can exercise them without a browser.

export const API_URL =
  'https://api.coingecko.com/api/v3/simple/price?ids=hive&vs_currencies=usd&include_24hr_change=true&include_last_updated_at=true';
export const COINGECKO_PAGE = 'https://www.coingecko.com/en/coins/hive';
export const REFRESH_MS = 60_000;
const TIMEOUT_MS = 8_000;

/** Turn a CoinGecko /simple/price response into a quote, or null if it's not usable. */
export function parseQuote(json) {
  const q = json && json.hive;
  if (!q || typeof q.usd !== 'number' || !Number.isFinite(q.usd) || q.usd <= 0) return null;
  return {
    usd: q.usd,
    change24h: Number.isFinite(q.usd_24h_change) ? q.usd_24h_change : null,
    updatedAt: Number.isFinite(q.last_updated_at) ? new Date(q.last_updated_at * 1000) : new Date(),
  };
}

/** HIVE trades well under $1, so show four decimals there and two above. */
export function formatPrice(usd) {
  const digits = usd < 1 ? 4 : 2;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(usd);
}

export function formatChange(pct) {
  if (pct === null || !Number.isFinite(pct)) return '–';
  const rounded = Math.abs(pct).toFixed(2);
  if (rounded === '0.00') return '0.00%';
  return `${pct > 0 ? '+' : '−'}${rounded}%`;
}

export function trendOf(pct) {
  if (pct === null || !Number.isFinite(pct) || Math.abs(pct) < 0.005) return 'flat';
  return pct > 0 ? 'up' : 'down';
}

export function formatTime(date, locale) {
  return new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' }).format(date);
}

export async function fetchQuote(fetchImpl = globalThis.fetch, timeoutMs = TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetchImpl(API_URL, { signal: controller.signal, headers: { accept: 'application/json' } });
    if (!res.ok) throw new Error(`CoinGecko responded ${res.status}`);
    const quote = parseQuote(await res.json());
    if (!quote) throw new Error('Unexpected response from CoinGecko');
    return quote;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Paint the block. `quote` is the latest good quote (or null); `failed` means
 * the most recent refresh didn't work. A stale quote is kept on screen and
 * labelled as such rather than blanked out.
 */
export function render(root, { quote, failed }, locale) {
  const doc = root.ownerDocument;
  const priceEl = root.querySelector('[data-price]');
  const changeEl = root.querySelector('[data-change]');
  const statusEl = root.querySelector('[data-status]');

  if (quote) {
    priceEl.textContent = formatPrice(quote.usd);
    changeEl.textContent = formatChange(quote.change24h);
    changeEl.dataset.trend = trendOf(quote.change24h);
  }

  const time = doc.createElement('time');
  if (quote) {
    time.setAttribute('datetime', quote.updatedAt.toISOString());
    time.textContent = formatTime(quote.updatedAt, locale);
  }

  statusEl.textContent = '';
  if (quote && !failed) {
    root.dataset.state = 'ok';
    statusEl.append('As of ', time, ' your time. Updates every minute.');
  } else if (quote) {
    root.dataset.state = 'stale';
    statusEl.append('Couldn’t refresh just now. Showing the price as of ', time, '.');
  } else {
    root.dataset.state = 'error';
    const link = doc.createElement('a');
    link.setAttribute('href', COINGECKO_PAGE);
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener');
    link.textContent = 'check it on CoinGecko';
    statusEl.append('The live price isn’t available right now. You can ', link, '.');
  }
}

/** Fetch now, then every `interval` ms while the tab is visible. */
export function start(root, { fetchImpl = globalThis.fetch, interval = REFRESH_MS, doc = root.ownerDocument } = {}) {
  let quote = null;
  let lastAttempt = 0;
  let timer = null;

  async function refresh() {
    lastAttempt = Date.now();
    try {
      quote = await fetchQuote(fetchImpl);
      render(root, { quote, failed: false });
    } catch {
      render(root, { quote, failed: true });
    }
  }

  function resume() {
    clearInterval(timer);
    timer = setInterval(refresh, interval);
  }

  doc.addEventListener('visibilitychange', () => {
    if (doc.hidden) {
      clearInterval(timer);
      return;
    }
    if (Date.now() - lastAttempt >= interval) refresh();
    resume();
  });

  const first = refresh();
  resume();
  return { refresh, stop: () => clearInterval(timer), ready: first };
}

if (typeof document !== 'undefined') {
  const root = document.getElementById('price');
  if (root) start(root);
}
