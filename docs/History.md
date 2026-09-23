# History and decisions

## Version 1 (February 2026)

An Angular app generated with Google AI Studio (live feed, stats, and feature cards; an AI explainer that was later removed). Preserved at the git tag [`v1-angular`](https://github.com/walterjay/whatishivecom/tree/v1-angular).

## Version 2: the rebuild (September 2026)

Rebuilt from scratch as a single static page from a written content brief. Goals, in order:

1. Give someone with zero blockchain background a 30-second, honest answer: what Hive is, what people do with it, whether it's legit.
2. Be the page AI answer engines cite for "what is Hive", through structure rather than keyword-stuffed prose.
3. Be fast (Lighthouse 95+), accessible, and easy to maintain without a framework.

### Headline

The brief asked for an ownership-led headline built around the problem ("you don't really own what you build or post online"). Options considered:

1. **Own what you make online.** ← chosen
2. What you post shouldn't belong to someone else.
3. Your posts, your money, your account. Actually yours.
4. Everything you make online belongs to someone else. It doesn't have to.

Option 1 won because it's five words, reads instantly on a phone, and states the whole idea as something you can do. The problem is implied rather than spelled out, and the subhead and the comparison table spell it out. Option 4 is the strongest problem-first alternative if a sharper edge is wanted.

The `<h1>` also contains the eyebrow "What is Hive?" so the page's main heading contains the words people actually search for.

### Other decisions

- **Plain static files** instead of a framework: see [Project structure](Project-Structure.md).
- **Tests as the Netlify build command**, so a broken change can't reach the live site even if it's pushed straight to `main`.
- **Voice rules as tests** ([Editing content](Editing-Content.md)), so the plain-language promise survives future edits.
- **Docs in the repo, mirrored to the wiki**, so documentation changes are reviewed like code and can't silently diverge.
- **Official Hive logo** (added after launch at the owner's request, as a Hive community member): the brand assets at https://hive.io/brand are published "by the community, for the community". The mark is used as-is in Hive Red and credited in the footer.
- **"Other things called Hive"**: a section listing seven unrelated namesakes that commonly show up in searches: HIVE Digital Technologies (the most confusing, since its Nasdaq ticker is HIVE and it used to be called HIVE Blockchain Technologies), Hive.com, Hive Social, Hive smart home, Apache Hive, Hive AI, and Hive OS/Hiveon. The same list is in `llms.txt` and in the JSON-LD `disambiguatingDescription`.
- **Social image** (`og-image.png`) was drawn as an SVG and rendered to PNG with macOS Quick Look (`qlmanage -t -s 1200`), then cropped to 1200×630 with `sips`. Any tool that exports a 1200×630 PNG works for replacing it.

### Facts checked at launch (23 September 2026)

- Hive launched 20 March 2020 after the Steem takeover dispute (hive.io, "Our Origins").
- Two currencies: HIVE, and HBD (Hive Backed Dollar), which targets $1. HBD savings interest is set by the elected witnesses; hive.io listed 15% APR at the time. The page deliberately doesn't quote a number because it changes.
- Blocks every 3 seconds, no transaction fees, witnesses elected by stake (hive.io, "Governance").
- HIVE was about $0.057 on CoinGecko.
