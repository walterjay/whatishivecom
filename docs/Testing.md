# Testing

Three layers, all automatic:

| Where | When | What runs | If it fails |
|---|---|---|---|
| GitHub Actions: **Tests** job | Every pull request and every push to `main` | `npm test`: HTML validation plus the Node test suite | The PR shows a red ✗ |
| GitHub Actions: **Lighthouse** job | Same | Lighthouse CI, 3 runs, mobile settings | The PR shows a red ✗ |
| Netlify build | Every deploy (including PR previews) | `npm test` (set as the build command in `netlify.toml`) | Netlify refuses to publish; the live site stays on the last good version |

## What the tests check

**`npm run validate`** runs [html-validate](https://html-validate.org) with its recommended rules on every `.html` file in `site/`.

**`tests/structure.test.mjs`**
- exactly one `<h1>`, and it mentions Hive; heading levels never skip
- sections appear in the order of the content brief, each labelled by its heading
- unique ids; every `#anchor` link has a target; every local file referenced exists
- external links are `https://`
- no render-blocking or inline scripts, no inline styles (both would break performance or the Content-Security-Policy)
- the price block has the hooks `price.js` needs, plus a no-JavaScript fallback
- the 404 page is `noindex` and links home

**`tests/content.test.mjs`**: the voice rules from [Editing content](Editing-Content.md): jargon, hype words, where "blockchain" may appear, hero subhead is one sentence, FAQ answers are 1–3 sentences, the brief's six FAQ questions are present, and the "last reviewed" date agrees everywhere.

**`tests/seo.test.mjs`**: title and description lengths, canonical URL, Open Graph and Twitter tags, social image exists, JSON-LD parses and defines Hive, **the FAQPage JSON-LD matches the visible FAQ word for word**, `robots.txt` explicitly allows the named search and AI crawlers, `sitemap.xml` and `llms.txt` are well formed.

**`tests/price.test.mjs`**: the price widget with CoinGecko faked: parsing good and bad responses, number formatting, HTTP errors, network failures, timeouts, the fresh, stale, and unavailable display states, refreshing on an interval, and pausing while the tab is hidden. The suite never makes a network request.

**Lighthouse** thresholds (`lighthouserc.json`): performance ≥ 95 and accessibility ≥ 95 fail the build; SEO ≥ 90 fails the build (it's not held to 95 because when Lighthouse runs against `localhost`, the canonical link to whatishive.com is flagged as "different domain", which costs a few points and doesn't happen in production); best practices ≥ 90 only warns (it can dip if CoinGecko rate-limits the CI machine). Each run uploads a full report; the link is in the job log under "Uploading…".

## Running tests on your computer

You need Node.js 24 or newer (https://nodejs.org).

```bash
npm install
npm test
```

To look at the site locally:

```bash
npm start
```

then open http://localhost:8080.

## Adding a test

Add a `*.test.mjs` file in `tests/`; it's picked up automatically. Use `node:test` and `node:assert/strict`, and parse pages with `loadPage()` from `tests/helpers.mjs`.
