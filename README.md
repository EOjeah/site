# Emmanuel’s blog

A minimal static blog built with Astro. Normal Markdown posts, YAML frontmatter, scoped Astro layouts, and one stylesheet. No Python builder, custom Markdown parser, database, or AI dependency.

## Start here

Use Node 24 LTS. The minimum supported by the installed Astro release is Node 22.12.0; Node 22.8.0 is too old. If you already use nvm:

```sh
nvm install
nvm use
npm ci
npm run dev
```

Without nvm, install Node 24 using your preferred manager or [the official Node download](https://nodejs.org/en/download), then run `npm ci` and `npm run dev`.

- [Write a post, set reading time, and add diagrams](docs/WRITING.md)
- [Deploy with GitHub Actions and protect canary](docs/DEPLOYMENT.md)
- [Understand or change the project](docs/ARCHITECTURE.md)
- [What was actually verified](docs/VERIFICATION.md)

The site starts with no published posts. Examples live in `docs/examples/`, outside the published collection. To try the authoring workflow locally:

```sh
cp docs/examples/thinking.svg src/content/blog/thinking.svg
cp docs/examples/first-post.md src/content/blog/first-post.md
npm run dev
```

Open `/` to see the optional SVG cover beside the summary, then `/writing/first-post/` to read the article and its inline diagram. Copy both files: the Markdown references the SVG beside it. Edit the example before committing it to a branch that deploys publicly.

## Commands

| Command | Purpose |
| --- | --- |
| `npm ci` | Install exactly the versions in the lockfile |
| `npm run dev` | Astro’s development server with live updates |
| `npm run check` | Astro and TypeScript diagnostics |
| `npm test` | Build fixture posts and verify Markdown, assets, reading time, cleanup, and invalid metadata |
| `npm run build` | Generate the complete static site in `dist/` |
| `npm run preview` | Serve the last build with Astro locally |
| `npm run preview:cloudflare` | Serve the last build using Wrangler’s local Pages runtime |
| `npm run deploy:canary -- --project-name=YOUR_PROJECT` | Check, build, then upload the local working tree to the canary branch |
| `npm run deploy:production -- --project-name=YOUR_PROJECT` | Check, build, then publish the local working tree to main |

The last two commands require your own Cloudflare authentication and an existing Pages project. Prefer the included GitHub Actions workflow for routine publication: it deploys a known Git commit. Before uploading private content, configure Access as described in the deployment guide.

## Project map

```text
src/
  content/blog/             Published Markdown collection; filenames become URLs
  content.config.ts         Validated frontmatter schema
  site.ts                   Name, introduction, and site description
  components/PostMeta.astro Date and reading-time display
  layouts/BaseLayout.astro  Shared document, navigation, and footer
  pages/index.astro         Homepage and chronological post index
  pages/writing/[...id].astro  Astro's standard static collection route
  pages/404.astro           Real 404 page for static hosting
  plugins/remark-reading-time.mjs  Astro's documented reading-time recipe
  styles/global.css        All visual styling
public/                    Files copied unchanged into every deployment
drawings/                  Editable Excalidraw files, not published
docs/                      Authoring, operations, examples, verification
tests/                     Node's built-in test runner; temporary fixture builds
.github/workflows/deploy.yml  Check/build/upload on main and canary
astro.config.mjs            Static output and Markdown processor configuration
package.json               Standard npm scripts and exact direct dependency versions
package-lock.json          Reproducible dependency graph
.nvmrc                     Node major version for local use and Actions
```

## Official documentation

- [Astro project structure](https://docs.astro.build/en/basics/project-structure/)
- [Astro content collections](https://docs.astro.build/en/guides/content-collections/)
- [Astro Markdown](https://docs.astro.build/en/guides/markdown-content/)
- [Astro reading-time recipe](https://docs.astro.build/en/recipes/reading-time/)
- [Cloudflare’s Astro Pages guide](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/)

Cloudflare's general direction for new applications is Workers. This project intentionally uses the separately documented Pages static-output path to retain Pages branch aliases and Access-protected previews. It does not use a Workers deployment configuration or a server-rendering adapter.

## Original notebook styling

The homepage restores the “A personal notebook” label, spacious introduction, and optional side-by-side summary covers. All introduction text is editable in `src/site.ts`. Instrument Serif headings and DM Sans body text load through the Google Fonts import at the top of `src/styles/global.css`. The layout itself remains ordinary Astro and CSS.
