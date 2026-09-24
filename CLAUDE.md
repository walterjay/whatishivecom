# whatishive.com

One static page explaining Hive in plain language. Files in `site/` are published as-is by Netlify from `main`; there is no build step.

- Run `npm test` before committing. It validates HTML and runs `tests/*.test.mjs` (node:test + linkedom).
- Copy rules are enforced by `tests/content.test.mjs`; read `docs/Editing-Content.md` before changing any text. In short: no jargon or hype in the body, "blockchain" at most once outside the FAQ and never in the hero, FAQ answers 1–3 sentences.
- The FAQ exists twice (visible HTML and FAQPage JSON-LD in `<head>`) and must match word for word; also update `site/llms.txt`.
- After content changes, bump the "last reviewed" date in both pages' footers and JSON-LD `dateModified`, `sitemap.xml`, and `llms.txt`.
- Pages: `site/index.html` (home), `site/get-started/index.html` (sign-up guide), and `site/invite/index.html` (invite pilot, form hosted on Tally; never add Netlify Forms, since the Starter plan pauses all sites at the form limit). New pages go in `PAGES` in `tests/helpers.mjs` and in `sitemap.xml`.
- Sign-up call to action: all buttons lead to `/get-started/`; to change providers (e.g. when lite accounts launch) follow "Change the sign-up call to action" in `docs/Editing-Content.md`.
- No inline scripts (except JSON-LD) and no `style=""` attributes: the CSP in `netlify.toml` blocks them.
- Documentation lives in `docs/` and is synced to the GitHub wiki by `.github/workflows/wiki.yml`; update it when behaviour changes.
- Branches: `main` = whatishive.com (production), `new` = new.whatishive.com (staging: a second Netlify project; `scripts/staging.mjs` adds noindex + a banner when `BRANCH=new`). Feature branches → PR into `new` → PR `new` → `main`.
- Branch feature work off `new`. Promote with a PR `new` → `main` merged as a merge commit (never squash), or the branches diverge.
- Merging: PRs into `new` may be merged (squash) once CI is green. Never merge into `main`: open the PR, report CI and preview results, and let the owner merge.
