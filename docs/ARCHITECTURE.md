# Architecture and maintenance

## Decisions

| Decision | Motivation | Tradeoff |
| --- | --- | --- |
| Static Astro output | Blog content changes when you publish; readers need only HTML, CSS, and images | A content edit needs a build/deployment |
| Markdown + YAML | Portable text format supported by ordinary editors and Astro docs | No browser CMS in this project |
| Astro content collection + schema | Standard loading, validation, and typed metadata | Metadata must conform to the schema |
| Separate layout, routes, components, and stylesheet | Each file has a recognizable responsibility | A few small files instead of one script |
| One documented remark plugin | Calculates reading time from rendered Markdown text | It is the only custom content-processing extension |
| Instrument Serif + DM Sans | Restores the original notebook typography | Google Fonts is fetched by the reader’s browser; fallback fonts work offline |
| No Cloudflare adapter | A static build does not need server-side rendering | Add the appropriate adapter if server rendering is introduced later |
| Pages Direct Upload + GitHub Actions | One build system, pinned CLI, explicit branches, private preview support | Cloudflare now favors Workers for new apps; Pages is an intentional choice |
| Branch-based drafts | Same output rules locally, on canary, and on production | Merging canary publishes every post in that branch |
| Examples outside the collection | No accidental placeholder essay goes live | Initial homepage has an empty writing list |

## Data flow

1. Astro's glob loader reads `src/content/blog/**/*.md` and validates frontmatter.
2. The official Unified processor renders Markdown and syntax-highlighted code.
3. The remark plugin adds the displayed reading time, using the author's override when supplied.
4. `index.astro` sorts collection entries by date and renders the homepage.
5. `writing/[...id].astro` uses `getStaticPaths()` and `render()` to emit each article.
6. `astro build` writes a fresh static output to `dist/`.
7. Wrangler uploads only that directory to Pages.

The collection folder determines what is published. There is no AI-generated post creation command, hidden publishing service, custom deployment backend, Python, or custom shell build wrapper.

## Common edits

- Name, notebook label, introduction, and writing-section note: `src/site.ts`.
- Optional summary cover: the post’s `cover.image` and `cover.alt` frontmatter; see `docs/WRITING.md`.
- Colors, typography, spacing, code blocks, images: `src/styles/global.css`.
- Navigation, footer, default metadata: `src/layouts/BaseLayout.astro`.
- Frontmatter rules: `src/content.config.ts`.
- Post page layout: `src/pages/writing/[...id].astro`.
- Homepage order and excerpts: `src/pages/index.astro`.
- Reading speed/estimate format: `src/plugins/remark-reading-time.mjs`.
- Deployment triggers: `.github/workflows/deploy.yml`.

## Dependencies and upgrades

Direct dependencies use exact versions; commit `package-lock.json`. `npm ci` reproduces the locked graph. Node 24 is recorded in `.nvmrc`; Actions reads the same file.

To plan an upgrade:

```sh
npm outdated
```

Read the relevant release and migration notes, install the versions you choose with `npm install --save-exact PACKAGE@VERSION` (and `--save-dev` for development tools), and run:

```sh
npm ci
npm run check
npm test
npm run build
npm run preview:cloudflare
```

Review on canary before merging. Do not delete the lockfile to fix an unrelated problem. The two GitHub setup actions use major tags; pin them to reviewed full commit SHAs if your repository requires immutable action references.

## Scope of the tests

`tests/blog.test.mjs` uses Node's built-in test runner. It copies the project into a temporary folder, renders real fixture articles, checks links/Markdown/images/reading-time overrides and sort order, verifies deleted routes disappear, and verifies invalid metadata fails the build. Test content never enters the real post collection or deployment output.

These tests do not authenticate to Cloudflare, create a project, configure DNS, or prove Access policies are effective. Those are account-level operations described separately.

## Standard references

- https://docs.astro.build/en/guides/content-collections/
- https://docs.astro.build/en/guides/markdown-content/
- https://docs.astro.build/en/recipes/reading-time/
- https://docs.astro.build/en/guides/images/
- https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/
- https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/
