# Deployment

The site is hosted on **Netlify**, connected to this GitHub repository.

## Branches and sites

| Branch | Site | Purpose |
|---|---|---|
| `main` | https://whatishive.com | Production. Only reviewed changes land here. |
| `new` | https://new.whatishive.com | Staging: try new features on a real URL before they go live. Hidden from search engines, with a "Test site" banner. |
| any other branch | a Netlify deploy preview link on its PR | Work in progress. |

## How a change goes live

```mermaid
flowchart LR
    A[feature branch] -->|PR, CI + preview| B[new<br/>new.whatishive.com]
    B -->|test it, then PR| C[main<br/>whatishive.com]
```

1. Make the change on a branch and open a pull request into **`new`**. CI runs the tests and Lighthouse, and Netlify posts a deploy preview link.
2. Merge it (by hand, after reviewing). Netlify deploys `new` to https://new.whatishive.com within a minute.
3. When you're happy with what's on staging, open a pull request from `new` into **`main`** and merge it. Netlify publishes it to https://whatishive.com.

Small fixes can go straight to a PR into `main` if they don't need testing on staging. PRs are never merged automatically.

### How staging differs from production

The `[context.new]` block in `netlify.toml` runs the same tests, then `scripts/staging.mjs`, which (on Netlify's build copy only):

- replaces `robots.txt` with `Disallow: /`, sends `X-Robots-Tag: noindex, nofollow`, and adds a `noindex` meta tag to every page, so the test site never competes with the real one in search;
- adds a "Test site: changes here are not live yet" banner linking to whatishive.com.

Canonical URLs still point at whatishive.com. `tests/staging.test.mjs` checks the script.

### One-time setup (already done once; here for reference)

1. **Netlify → Site configuration → Build & deploy → Branches and deploy contexts → Branch deploys:** "Let me add individual branches", add `new`.
2. **Cloudflare DNS for whatishive.com:** add a `CNAME` record, name `new`, target `new--whatishive.netlify.app`, **Proxy status: DNS only** (grey cloud), so Netlify can issue the HTTPS certificate.
3. **Netlify → Domain management → Branch subdomains → New subdomain:** branch `new`, subdomain `new`. Wait for the HTTPS certificate (usually a few minutes).

## Netlify settings

Everything that matters lives in `netlify.toml`, which **overrides the Netlify dashboard**:

| Setting | Value | Why |
|---|---|---|
| Publish directory | `site` | Only the website files are public, never tests or docs. |
| Build command | `npm test` | A failing test stops the deploy. |
| Node version | 24 | Matches `.nvmrc` and CI. |
| Headers | CSP, nosniff, referrer and permissions policies | Security hardening; see [Project structure](Project-Structure.md). |

The domain (whatishive.com, with www redirecting to it) and HTTPS certificate are configured in the Netlify dashboard under **Domain management**. Nothing in the repo controls them.

## Rolling back

Either of these works:

- **Fastest:** Netlify dashboard → **Deploys** → pick an earlier deploy → **Publish deploy**. Instant, but the next push to `main` will deploy over it.
- **Proper:** revert the bad commit on GitHub (open the PR → **Revert**, or `git revert <sha>`), then merge. Netlify deploys the reverted version.

## The previous version

The original Angular version built with Google AI Studio is preserved at the git tag **`v1-angular`**: https://github.com/walterjay/whatishivecom/tree/v1-angular
