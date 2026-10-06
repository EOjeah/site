import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cp, mkdtemp, mkdir, readFile, rm, symlink, writeFile, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const project = fileURLToPath(new URL('../', import.meta.url));

// Exercise Astro itself in a temporary project. Test articles never touch the real blog.
test('Markdown publishing, image output, reading times, cleanup, and schema validation', async (t) => {
  const fixture = await mkdtemp(path.join(tmpdir(), 'emmanuel-blog-test-'));
  t.after(() => rm(fixture, { recursive: true, force: true }));
  for (const entry of ['src', 'public', 'astro.config.mjs', 'package.json', 'tsconfig.json']) {
    await cp(path.join(project, entry), path.join(fixture, entry), { recursive: true });
  }
  await symlink(path.join(project, 'node_modules'), path.join(fixture, 'node_modules'), 'dir');
  const posts = path.join(fixture, 'src/content/blog');
  await rm(posts, { recursive: true, force: true });
  await mkdir(posts, { recursive: true });

  const build = () => spawnSync(process.execPath, [
    path.join(project, 'node_modules/astro/bin/astro.mjs'), 'build', '--root', fixture,
  ], {
    cwd: fixture,
    encoding: 'utf8',
    env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1', SITE_URL: 'https://blog.example.test' },
  });

  await writeFile(path.join(posts, 'automatic.md'), `---\ntitle: Automatic estimate\ndescription: A real Markdown fixture.\npublishedAt: 2026-09-24\n---\n\n${'word '.repeat(450)}\n`);
  await writeFile(path.join(posts, 'diagram.svg'), '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="40"><text x="5" y="25">input → output</text></svg>');
  await writeFile(path.join(posts, 'pixel.png'), Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j8ioAAAAASUVORK5CYII=', 'base64'));
  await writeFile(path.join(posts, 'override.md'), `---
title: Diagram explanation
description: Code, links, lists, tables, and diagrams.
publishedAt: 2026-09-25
updatedAt: 2026-09-26
readingMinutes: 7
cover:
  image: ./diagram.svg
  alt: "Homepage cover diagram"
---

## A real heading

Here is **bold text**, *emphasis*, and [an external link](https://example.com).

- First item
- Second item

| Input | Output |
| --- | --- |
| One | Two |

\`\`\`typescript
const greeting: string = 'hello';
\`\`\`

![A diagram with readable alternative text](./diagram.svg)

![A raster image](./pixel.png)
`);

  await t.test('renders Markdown and includes only browser-ready assets', async () => {
    const result = build();
    assert.equal(result.status, 0, result.stdout + result.stderr);
    const output = path.join(fixture, 'dist');
    const home = await readFile(path.join(output, 'index.html'), 'utf8');
    const article = await readFile(path.join(output, 'writing/override/index.html'), 'utf8');
    const automatic = await readFile(path.join(output, 'writing/automatic/index.html'), 'utf8');
    assert.ok(home.indexOf('Diagram explanation') < home.indexOf('Automatic estimate'));
    assert.match(home, /7 min read/);
    const covers = [...home.matchAll(/<img\b[^>]*\bsrc="([^"]+)"[^>]*>/g)];
    assert.equal(covers.length, 1, 'Only the post with cover metadata gets a cover');
    assert.match(covers[0][0], /alt="Homepage cover diagram"/);
    await access(path.join(output, covers[0][1]));
    assert.doesNotMatch(article, /alt="Homepage cover diagram"/, 'Summary covers do not become article hero images');
    assert.match(article, /7 min read/);
    assert.match(automatic, /3 min read/);
    assert.match(article, /<strong>bold text<\/strong>/);
    assert.match(article, /<table>/);
    assert.match(article, /<li>First item<\/li>/);
    assert.match(article, /class="astro-code/);
    assert.match(article, /href="https:\/\/example.com"/);
    assert.match(article, /rel="canonical" href="https:\/\/blog.example.test\/writing\/override\/"/);
    const images = [...article.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/g)];
    assert.equal(images.length, 2);
    for (const [, imageUrl] of images) {
      await access(path.join(output, decodeURIComponent(imageUrl.split('?')[0])));
    }
    await access(path.join(output, '404.html'));
    await assert.rejects(access(path.join(output, 'docs')));
    await assert.rejects(access(path.join(output, 'drawings')));
  });

  await t.test('removing a post also removes its previously built URL', async () => {
    await rm(path.join(posts, 'override.md'));
    const result = build();
    assert.equal(result.status, 0, result.stdout + result.stderr);
    await assert.rejects(access(path.join(fixture, 'dist/writing/override/index.html')));
  });

  await t.test('invalid reading-time metadata fails the build', async () => {
    await writeFile(path.join(posts, 'invalid.md'), '---\ntitle: Invalid\ndescription: Invalid estimate\npublishedAt: 2026-09-25\nreadingMinutes: -1\n---\nText.\n');
    const result = build();
    assert.notEqual(result.status, 0);
    assert.match(result.stdout + result.stderr, /readingMinutes/);
  });
});
