# SEO and AI search

A secondary goal of the site is to be the page AI answer engines cite when someone asks "what is Hive". That's handled with structure and markup; the prose itself stays written for people.

## What's in place

| Piece | Where | Purpose |
|---|---|---|
| Semantic HTML | `index.html` | One `<h1>`, an `<h2>` per section, `<h3>` per FAQ question and card. Sections are labelled landmarks. |
| JSON-LD: `DefinedTerm` | `<head>` of `index.html` | Declares "Hive" as the thing this page defines, with a one-paragraph definition and `sameAs` links to hive.io, the source code, and CoinGecko. |
| JSON-LD: `FAQPage` | `<head>` of `index.html` | Machine-readable copy of the FAQ. Must match the visible FAQ exactly; a test enforces it. |
| JSON-LD: `WebSite`, `WebPage`, `Organization` | `<head>` | Ties the page, site, and publisher together; `dateModified` shows freshness. |
| Meta tags | `<head>` | Title, description, canonical, Open Graph, Twitter card, all plain factual statements. |
| `llms.txt` | `site/llms.txt` | A plain-text summary written for language models: definition, key facts, condensed FAQ, links. Follows the [llms.txt](https://llmstxt.org) format. Linked from the page with `<link rel="alternate">` and in the footer. |
| `robots.txt` | `site/robots.txt` | Allows everything, and names the search and AI crawlers explicitly: GPTBot, OAI-SearchBot, ChatGPT-User, PerplexityBot, Perplexity-User, ClaudeBot, Claude-SearchBot, Claude-User, anthropic-ai, Google-Extended, Applebot-Extended, CCBot, meta-externalagent, Amazonbot, plus Googlebot, Bingbot, DuckDuckBot, and Applebot. |
| `sitemap.xml` | `site/sitemap.xml` | One URL, with `lastmod`. |

## Why `DefinedTerm` and not `Organization` for Hive

Hive isn't a company. There's no legal entity or CEO to describe, so marking it up as an `Organization` would be inaccurate. `DefinedTerm` says exactly what this page does: define a term. The `Organization` in the markup is the publisher of the page (whatishive.com), not Hive.

Wikipedia isn't in `sameAs` because, as of September 2026, there is no standalone English Wikipedia article for the Hive network.

## Checking it

- **Google Rich Results Test:** https://search.google.com/test/rich-results?url=https%3A%2F%2Fwhatishive.com%2F
- **Schema.org validator:** https://validator.schema.org/#url=https%3A%2F%2Fwhatishive.com%2F
- **Share previews:** paste the URL into https://www.opengraph.xyz or post it in a private chat.
- **Google Search Console:** add the property for whatishive.com and submit `https://whatishive.com/sitemap.xml`. This is the single most useful thing for getting indexed quickly.

Note: since 2023, Google only shows FAQ *rich results* (the expandable questions in search results) for government and health sites. The FAQPage markup is still worth having, because AI engines and other search engines use it to understand the page.
