# What is Hive?

Source for **[whatishive.com](https://whatishive.com)**: a fast, plain-language, one-page explanation of Hive for people who have never heard of it.

[![CI](https://github.com/walterjay/whatishivecom/actions/workflows/ci.yml/badge.svg)](https://github.com/walterjay/whatishivecom/actions/workflows/ci.yml)

- **The site** is plain static files in [`site/`](site/). No framework, no build step.
- **Deploys** automatically to Netlify when `main` changes. Netlify runs the tests first and won't publish if they fail.
- **Every pull request** runs HTML validation, a test suite (structure, voice rules, SEO markup, price widget), and Lighthouse.

## Quick start

```bash
npm install     # test tooling only
npm test        # validate HTML and run the test suite
npm start       # serve site/ at http://localhost:8080
```

Requires Node.js 24+ for the tests. The site itself needs nothing.

## Documentation

See the **[wiki](https://github.com/walterjay/whatishivecom/wiki)** (generated from [`docs/`](docs/)):

- [Project structure](docs/Project-Structure.md)
- [Editing content](docs/Editing-Content.md): read this before changing any copy
- [Testing](docs/Testing.md)
- [Deployment](docs/Deployment.md)
- [SEO and AI search](docs/SEO-and-AI.md)
- [History and decisions](docs/History.md)

The previous Angular version is preserved at the tag [`v1-angular`](https://github.com/walterjay/whatishivecom/tree/v1-angular).
