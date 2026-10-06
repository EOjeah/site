# Verification report

Checked on 2026-09-25. This report distinguishes executed checks from account-level steps that remain unverified.

## Environment

- macOS arm64.
- Node 24.19.0 used for verification; npm 10.8.2.
- Astro 7.3.5.
- Wrangler 4.141.0.
- Exact package versions are recorded in `package-lock.json`.
- The machine's default Node 22.8.0 was not used because it is below Astro's declared minimum of 22.12.0. It was not silently upgraded globally.

## Executed successfully

| Check | Evidence |
| --- | --- |
| Clean locked installation | `npm ci` completed, 420 packages installed, audit reported zero vulnerabilities at the time of the run |
| Type checking | `npm run check`: zero errors, warnings, or hints |
| Regression suite | `npm test`: all three subtests and the parent test passed |
| Markdown | Real Astro fixture builds produced headings, bold text, links, lists, tables, and highlighted TypeScript |
| Reading time | 450-word fixture displayed 3 minutes; explicit override displayed 7 minutes on both homepage and article |
| Images | Relative SVG and PNG references produced real files in build output |
| Post ordering | Newer fixture listed before older fixture |
| Canonical metadata | `SITE_URL` produced the expected article canonical URL |
| Deleted routes | Removing a fixture Markdown file and rebuilding removed its old HTML route |
| Invalid metadata | Negative readingMinutes failed the build with the field named |
| Source-only folders | docs and drawings were absent from deployment output |
| Empty blog | Final build produced the homepage and 404 page without inventing an article |
| Author guide | Copied the preserved essay and diagram into the collection using the documented commands, built successfully, and inspected the rendered article and image in a browser; then removed the copies and rebuilt |
| Local Cloudflare runtime | `npm run preview:cloudflare -- --ip=127.0.0.1 --port=8788` launched Wrangler Pages on localhost |
| HTTP serving | Homepage 200, favicon 200, nonexistent route 404 through Wrangler |
| CLI syntax | Installed Wrangler help verified positional project name, production-branch, project-name, and branch options |
| Workflow syntax | YAML parsed successfully and main/canary branch configuration was inspected |

The empty collection emits Astro's informational “No files found”/empty collection messages until you add a post. Those are expected, not missing application files. The original sample now lives under docs/examples, outside the collection.

## Not claimed or tested

- No upload to the user's own Cloudflare account was performed. `npm exec -- wrangler whoami` reported that Wrangler was not authenticated.
- No Cloudflare project was created or production branch changed.
- No hosted Access policy or private preview authentication was verified.
- No custom domain/DNS/TLS configuration was applied.
- The GitHub Actions workflow has not executed on GitHub; local checks covered its build/test commands and YAML syntax.
- Browser inspection covered the desktop article. This report does not claim device-specific browser coverage.

To complete end-to-end verification, select supported Node, authenticate with `npm exec -- wrangler login`, reuse/create the correct Pages project, configure Access, upload the non-sensitive empty site, and check the hosted alias/hash/asset URLs while signed out and signed in. Follow docs/DEPLOYMENT.md in order.

The earlier hosted prototype is a separate deployment. These changes were made in the self-managed project at `/Users/chukky/Documents/Codex/emmanuel-blog`; they do not silently update that prototype.

## SVG starter example follow-up

The starter `docs/examples/first-post.md` now embeds the adjacent `thinking.svg` using ordinary Markdown. Executed the documented two-file copy in a temporary project and ran the real Astro build. Verified the article contains the image with descriptive alt text and the referenced SVG exists in generated output. The README and writing guide both copy the SVG before the Markdown file.

## Optional summary covers and notebook layout

Restored Instrument Serif/DM Sans, the notebook introduction, and the optional side-by-side homepage cover. `npm run check`, `npm test`, and `npm run build` passed. The regression fixture includes one post with a cover and another without; it verifies exactly one cover is rendered, its emitted asset exists, and the cover is not automatically inserted into the full article. Both supplied Markdown examples include working cover frontmatter.
