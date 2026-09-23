# Deployment

The site is hosted on **Netlify**, connected to this GitHub repository.

## How a change goes live

1. Make the change on a branch and open a pull request into `main`.
2. GitHub Actions runs the tests and Lighthouse. Netlify builds a **deploy preview** and comments a preview link on the PR.
3. Merge the PR. Netlify sees the new commit on `main`, runs `npm test`, and publishes `site/` to https://whatishive.com, usually within a minute.

Pushing straight to `main` also deploys. The PR route just gives you the checks and a preview first.

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
