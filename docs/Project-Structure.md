# Project structure

```
site/                  ← everything Netlify publishes (and nothing else)
  index.html           the page, including meta tags and JSON-LD structured data
  404.html             "page not found" (Netlify serves it automatically)
  assets/styles.css    all styling; light and dark mode; system fonts only
  assets/price.js      the live HIVE price block (ES module, loaded deferred)
  llms.txt             plain-text summary for language models
  robots.txt           crawler rules (everyone allowed, AI crawlers named explicitly)
  sitemap.xml          one-URL sitemap
  favicon.svg          browser tab icon
  apple-touch-icon.png home-screen icon (180×180)
  og-image.png         social share image (1200×630)

tests/                 Node test suite (node:test), run by `npm test`
  helpers.mjs          shared helpers (HTML parsing, text normalisation)
  structure.test.mjs   headings, landmarks, links, assets, no blocking scripts
  content.test.mjs     the voice rules: jargon, hype, "blockchain" placement, FAQ length
  seo.test.mjs         meta tags, JSON-LD ↔ visible FAQ, robots, sitemap, llms.txt
  price.test.mjs       price widget logic with CoinGecko faked out

docs/                  this documentation (synced to the GitHub wiki)
.github/workflows/
  ci.yml               tests + Lighthouse on every pull request and push to main
  wiki.yml             copies docs/ to the GitHub wiki when docs change on main

netlify.toml           Netlify build settings and security headers (overrides the dashboard)
lighthouserc.json      Lighthouse CI score thresholds
.htmlvalidate.json     HTML validator rules
package.json           test tooling only; the site itself has no dependencies
.nvmrc                 Node version (24) used by CI and Netlify
CLAUDE.md              short brief for AI coding assistants working in this repo
```

## Design choices

- **No framework, no build.** The page is a single document. A framework would add weight and a build step without adding anything a reader would notice. What's in `site/` is exactly what's served.
- **System fonts.** Zero font downloads, so text renders immediately.
- **One small script.** Only the price block needs JavaScript. It's an ES module, so it never blocks rendering, and the page reads fine with JavaScript off (the block shows a link to CoinGecko instead).
- **Colours as CSS variables** at the top of `styles.css`, redefined for dark mode. The accent is Hive red, darkened to `#c8102e` so red text passes WCAG AA contrast (4.5:1) on every background used.
- **Strict Content-Security-Policy** (in `netlify.toml`): only the site's own files may run, and the only outside connection allowed is `api.coingecko.com`. This is why the page has no inline scripts (JSON-LD is data, not script, so it's fine) and no `style="…"` attributes. The tests check both.

## Live price block

`site/assets/price.js`:

1. On load, fetches `https://api.coingecko.com/api/v3/simple/price?ids=hive&vs_currencies=usd&include_24hr_change=true&include_last_updated_at=true` (the public API needs no key).
2. Shows the price (4 decimals under $1), the 24-hour change (green up / red down), and an "as of" time from CoinGecko's own timestamp.
3. Refreshes every 60 seconds, but only while the tab is visible, which keeps well inside CoinGecko's rate limits.
4. If a refresh fails, it keeps the last price and says it's stale. If it never got a price, it shows a link to CoinGecko instead.

The block's state is exposed as `data-state="loading|ok|stale|error"` on `#price`, handy for debugging.
