# whatishive.com

A one-page, plain-language answer to "what is Hive?" for someone who has never heard of it. It's not a crypto-investor page or a marketing funnel. It's one honest, well-written page that also happens to be easy for search engines and AI answer engines (ChatGPT, Perplexity, Google AI Overviews) to read and cite.

- **Live site:** https://whatishive.com
- **Repository:** https://github.com/walterjay/whatishivecom
- **Hosting:** Netlify, deploying automatically from the `main` branch

## At a glance

| | |
|---|---|
| What it is | Plain HTML, CSS, and a small bit of JavaScript in `site/`. No framework, no build step. |
| How it ships | Push or merge to `main`, then Netlify runs the tests and publishes `site/`. |
| How it's checked | Every pull request runs HTML validation, a Node test suite, and Lighthouse. |
| Live data | The HIVE price, fetched in the browser from CoinGecko every 60 seconds. |

## Pages in this wiki

- [Project structure](Project-Structure.md): what every file does
- [Editing content](Editing-Content.md): how to change copy safely, plus the voice rules
- [Testing](Testing.md): what the tests check and how to run them
- [Deployment](Deployment.md): Netlify, previews, rollbacks
- [SEO and AI search](SEO-and-AI.md): structured data, `llms.txt`, `robots.txt`, sitemap
- [History and decisions](History.md): the rebuild, and why things are the way they are

> These pages are generated from the `docs/` folder in the repository. Edit them there (in a pull request), not in the wiki UI, or your wiki edits will be overwritten on the next sync.
