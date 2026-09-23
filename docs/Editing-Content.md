# Editing content

All copy lives in `site/index.html`. Edit it directly; there's nothing to compile.

## The voice rules

These come from the original content brief and are **enforced by `tests/content.test.mjs`**. If you break one, the pull request goes red and Netlify won't deploy.

1. **Write for someone with zero blockchain background** who just heard the name and wants a 30-second answer: what is it, what do people do with it, is it legit.
2. **No "blockchain" in the hero.** It may appear **once** in the body (it's in the "Nobody's in charge" card) and is explained properly only in the FAQ.
3. **No jargon in the body:** no DPoS, consensus, witnesses, fork, wallet address, decentralised, dApp, web3, tokenomics, staking, smart contract, peer-to-peer, censorship-resistant. The FAQ is exempt.
4. **Explain what it does, not how it works.** "Nobody can quietly delete what you made", not "censorship-resistant". "Send money like a text message", not "fee-less peer-to-peer transactions".
5. **No hype:** revolutionary, next big thing, game-changer, disrupt, to the moon, get rich, and so on are banned everywhere, including `llms.txt`.
6. **FAQ answers are 1–3 sentences**, factual, and make sense on their own. AI engines quote them individually.
7. **Be honest about trade-offs.** No password reset, payments can't be reversed, the price is volatile, posts are permanent. Saying so is what makes the page trustworthy.

## Common tasks

### Change the headline

Edit `.hero-headline` in `index.html`. Also update `og:image:alt` and `twitter:image:alt`. If the wording changes a lot, regenerate `og-image.png` so share previews match (see [History](History.md) for how it was made).

### Edit an FAQ answer

An FAQ answer exists in **two places** that must match word for word (straight vs curly quotes don't matter):

1. The visible `<div class="faq-item">` in the FAQ section.
2. The `FAQPage` entry in the `<script type="application/ld+json">` block in `<head>`.

`tests/seo.test.mjs` fails if they drift apart. Also update the matching line in `site/llms.txt` (condensed wording is fine there).

### Add an FAQ question

Add a new `faq-item` (with a unique `id`), a matching `Question` in the JSON-LD `mainEntity` array **in the same position**, and a line in the `## FAQ` section of `llms.txt`.

### Change the sign-up call to action (for example, when lite accounts launch)

Every route into Hive ends at `/get-started/`, so most changes happen on that one page. The places that point people to sign up:

| Where | What to change |
|---|---|
| `site/get-started/index.html`, step 1 | The sign-up buttons (currently Ecency and InLeo) and their descriptions |
| `site/get-started/index.html`, "Even easier sign-up is on the way" | Replace with a short note once lite accounts are live; update the bottom "Create a free account" button |
| `site/get-started/index.html`, HowTo JSON-LD | Step 1's `text` (and any other step you change) |
| `site/index.html`, FAQ "How do I actually get started?" | Visible answer **and** its JSON-LD copy |
| `site/llms.txt` | The "How do I get started?" line |
| `tests/content.test.mjs`, `SIGNUP_LINKS` | The list of sign-up URLs the buttons are allowed to use |

The hero button, header button, and "Where to go next" card all point at `/get-started/` and don't need to change.

### The invite pilot (/invite/)

`site/invite/index.html` explains the pilot and links to the Tally form at https://tally.so/r/rj7OV2 (responses are in Walter's Tally account, not Netlify). Forms deliberately stay off Netlify: on the Starter plan, going over the form-submission limit would pause every site on the account.

- To close or pause the pilot, change the page copy and point the buttons back to `/get-started/`, or close the form in Tally.
- If the form link changes, update both buttons and `TALLY_FORM` in `tests/content.test.mjs`.
- The page promises that private keys are never shared (Ecency's "Invited by a friend" flow) and explains the recovery-account role; keep both if the process changes.

### Update "Other things called Hive"

Each namesake is a `<div class="namesake">` with a `<dt>` (name, linked to its official site) and a `<dd>` (one plain sentence or two). The tests expect 5–8 entries. Keep the list in sync with the "Not related to" line in `llms.txt` and the `disambiguatingDescription` in the JSON-LD.

### Add or change a link

External links must use `https://` and open in a new tab with `target="_blank" rel="noopener"`, so readers keep this page open; internal links stay in the same tab. Tests enforce both. The "Where to go next" cards are a `<ul class="link-grid">`; copy an existing `<li>`.

### After any content change: bump the "last reviewed" date

Update the date everywhere it appears (the test checks they agree):

- `index.html` and `get-started/index.html` footers: `<time datetime="YYYY-MM-DD">`
- `index.html` and `get-started/index.html` JSON-LD: `"dateModified"`
- `site/sitemap.xml`: `<lastmod>` for each page
- `site/llms.txt`: `Last reviewed: YYYY-MM-DD`

## Checking a change

Open a pull request. CI runs the tests and Lighthouse, and Netlify posts a deploy preview link you can open on your phone. See [Testing](Testing.md) and [Deployment](Deployment.md).
