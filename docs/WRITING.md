# Writing and diagrams

## 1. Create a post

From the repository root:

```sh
cp docs/examples/thinking.svg src/content/blog/thinking.svg
cp docs/examples/first-post.md src/content/blog/my-first-post.md
npm run dev
```

Open the Local URL printed by Astro. The article is at `/writing/my-first-post/`. It includes a working SVG diagram. Saving the file updates the local preview.

Copy **both files**. The starter post contains this normal Markdown image reference:

```md
![A thought becomes a sketch, then a clearer idea.](./thinking.svg)
```

The `./` means “next to this Markdown file.” The text in square brackets describes the diagram for screen readers and when the image cannot load. Your files will look like this:

```text
src/content/blog/
  my-first-post.md
  thinking.svg
```

To replace the example, export your Excalidraw drawing as SVG, save it here as (for example) `queue.svg`, then change the image line to `![How work moves through the queue.](./queue.svg)`. There is no component, import statement, or configuration to add. To put it in a subfolder, use `./images/queue.svg` instead.

If the example post was already copied before you received the SVG, copying `thinking.svg` into the same folder fixes the missing-image reference. Do not overwrite a post you have already edited; insert the image line into it instead.

A post uses normal Markdown with YAML frontmatter:

```md
---
title: "Understanding backpressure"
description: "What happens when producers outrun consumers."
publishedAt: 2026-09-25
---

Start with the question you want to answer.

## A bounded queue

Write your explanation here.
```

Use ISO dates (`YYYY-MM-DD`). Quote titles/descriptions containing colons or other YAML punctuation. Never insert HTML into metadata fields; Astro escapes these values when rendering them.

## 2. Know the supported metadata

| Field | Required | Meaning |
| --- | --- | --- |
| `title` | Yes | Heading and document title |
| `description` | Yes | Homepage excerpt and page description |
| `publishedAt` | Yes | Displayed date; also sorts the homepage newest first |
| `updatedAt` | No | Displays a separate updated date |
| `readingMinutes` | No | Positive whole-number reading-time override |
| `cover` | No | Homepage summary image, with an `image` path and descriptive `alt` text |
| `slug` | No | Astro glob loader's standard override for the filename-derived URL |

Astro validates the schema in `src/content.config.ts`. Missing required fields and invalid estimates stop the build with the filename and field name.

Dates are metadata, not a scheduler: a future `publishedAt` does not delay publication. Every Markdown file in the collection is included in the build. There is intentionally no custom `draft` flag or hidden build mode. Keep unfinished work on canary or outside `src/content/blog/`, and review the complete diff before merging to main.

Renaming a file changes its URL. To keep an existing URL, retain the filename or set `slug: the-existing-slug` in frontmatter. Existing published links need redirects if you intentionally change their URLs.

## Optional cover image in the homepage summary

The example post includes a cover. To add one to any post, put this block inside its YAML frontmatter:

```yaml
cover:
  image: ./thinking.svg
  alt: "A thought becomes a sketch, then a clearer idea."
```

The path is relative to the Markdown file, just like an inline diagram. SVG, PNG, JPEG, and WebP exports work here. Both `image` and `alt` are required when a `cover` block exists. This uses Astro's standard content-collection image helper and `Image` component.

The homepage places the image beside the title and excerpt on wider screens, and above them on mobile. The full diagram is preserved without cropping. Clicking the cover opens the post. The cover is not automatically repeated at the top of the article: add an ordinary Markdown image in the article body wherever you want it.

For a text-only summary, remove the **whole `cover` block**, including its indented lines. Do not leave an empty `cover:` entry. The text uses the available width, with no blank image placeholder.

For example, all of this goes at the top of a post:

```yaml
---
title: "Thinking with a pencil"
description: "How a small drawing can make an idea clearer."
publishedAt: 2026-09-25
cover:
  image: ./thinking.svg
  alt: "A thought becomes a sketch, then a clearer idea."
---
```

The required files are just the post and its SVG, side by side. No layout edits or JavaScript are needed. See [Astro's collection image documentation](https://docs.astro.build/en/guides/images/#images-in-content-collections).

## 3. Reading times

Without an override, the reading-time plugin calculates a text estimate with the `reading-time` package (its default is 200 words/minute), rounds up, and displays at least one minute. It processes Markdown text rather than counting generated HTML tags. Both the homepage and article use that same result.

For diagram-heavy articles or exercises, set your own estimate:

```yaml
readingMinutes: 8
```

Remove the field to return to automatic estimation. `0`, negative values, fractions, and strings such as `"8 minutes"` are invalid. Automated estimates do not measure how long it takes to study a diagram or work through code; use the override when that matters.

The small plugin in `src/plugins/remark-reading-time.mjs` follows [Astro's official recipe](https://docs.astro.build/en/recipes/reading-time/). It is a documented Markdown extension, not a custom parser.

## 4. Write normal Markdown

Astro renders headings, links, emphasis, blockquotes, ordered/unordered lists, tables, and fenced code blocks. Add the language after the opening code fence for syntax highlighting:

````md
```typescript
const queue: string[] = [];
queue.push('work');
```
````

The layout already supplies the post title as an `h1`. Start article sections at `##`. Use descriptive link text and image alternative text.

See [Astro's Markdown documentation](https://docs.astro.build/en/guides/markdown-content/). MDX is not installed; add the official integration only if you later need components inside posts.

## 5. Save an Excalidraw diagram

1. Save the editable drawing as `drawings/backpressure.excalidraw`.
2. In Excalidraw, export an SVG or PNG. Use SVG for crisp diagrams; PNG is useful when the drawing includes raster images.
3. Save the export to `src/content/blog/images/backpressure.svg` (create the `images` folder first).
4. In `src/content/blog/understanding-backpressure.md`, reference it with a relative URL:

```md
![A producer sends work into a bounded queue, which slows the producer when full.](./images/backpressure.svg)
```

Astro resolves and processes the referenced local image during the build. A missing relative image is a build error. Width is responsive and the original aspect ratio is preserved.

To make a full-size original available in a new page using plain Markdown, put an intentionally public export in `public/images/backpressure.svg` and use:

```md
[![A producer, bounded queue, and consumer.](/images/backpressure.svg)](/images/backpressure.svg)
```

This uses ordinary links, with no JavaScript image viewer dependency. Files in `public/` are copied as-is and are public even if no post links to them. Prefer imported images under `src/` for normal post content.

The editable `.excalidraw` file in `drawings/` is not copied into the website. Excalidraw can optionally embed editable scene data in exports: disable that export option if you do not want to distribute it in the SVG/PNG itself.

## 6. Add other images

PNG, JPEG, WebP, and SVG can be referenced with the same relative-image Markdown syntax. Keep large original photography outside `public/`; Astro can optimize imported raster images.

A simple convention:

```text
src/content/blog/
  understanding-backpressure.md
  images/
    backpressure.svg
    benchmark.png
drawings/
  backpressure.excalidraw
```

The glob loader reads `*.md` only; it does not create posts from image files. See [Astro images](https://docs.astro.build/en/guides/images/).

## 7. Check, preview, then publish

```sh
npm run check
npm test
npm run build
npm run preview:cloudflare
```

`preview:cloudflare` serves the already-built `dist/` locally; rebuild after edits. It does not upload anything or reproduce account-level Access authentication.

Commit to canary, inspect the authenticated hosted preview, then merge into main. See [DEPLOYMENT.md](DEPLOYMENT.md). A local preview is not evidence that your hosted authentication is configured correctly.

## 8. Edit or remove a post

Edit its Markdown file and optionally set `updatedAt`. To remove a post, delete its Markdown file and rebuild. Astro regenerates the output and removes the deleted route. Delete unused image exports yourself when no longer needed, especially anything under `public/`.

## Try the preserved example

The original generated essay is retained as an example outside the live collection. To preview it:

```sh
cp docs/examples/thinking-with-a-pencil.md src/content/blog/
cp docs/examples/thinking.svg src/content/blog/
npm run dev
```

This is example text, not Emmanuel's authored writing. Replace or remove it before your public release. No template hardcodes a sample label or diagram into posts.
