# Deploy this Astro blog to Cloudflare Pages

This guide is for the project in this repository, using its installed Astro and Wrangler versions. It replaces the earlier Python-based instructions. Commands below run from the repository root, where `package.json` lives.

## 1. Select the correct deployment model

This site builds to static HTML/CSS/images in `dist/`:

```text
Markdown → Astro build → dist/ → Cloudflare Pages
```

Use **Pages Direct Upload** and `wrangler pages deploy`. Do not use `wrangler deploy`: that is the Workers deployment model and expects a different configuration.

No `@astrojs/cloudflare` adapter is needed for this static build. The adapter is for applications that require Cloudflare server-side execution. Cloudflare's [Astro Pages guide](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/) documents `npm run build` and `dist`. Astro's [current general Cloudflare guide](https://docs.astro.build/en/guides/deploy/cloudflare/) now recommends Workers for new applications. We intentionally retain Pages for its documented preview aliases and Access protection.

Direct Upload gives GitHub Actions ownership of building and uploading. Do not also configure Cloudflare Git builds for this project. A Direct Upload project cannot later switch to Git integration; you would create a new project for that. [Direct Upload documentation](https://developers.cloudflare.com/pages/get-started/direct-upload/)

## 2. Install supported tooling

Use Node 24 LTS. The project's `.nvmrc` selects that major version, and `.npmrc` rejects unsupported Node versions on install. The installed Astro requires Node >=22.12.0. Node 22.8.0, which was present on this machine, does not satisfy it.

If nvm is already installed:

```sh
nvm install
nvm use
node --version
npm ci
```

Otherwise install Node 24 using your existing version manager or the [official Node installer](https://nodejs.org/en/download), open a new terminal, confirm `node --version`, and run `npm ci`.

Do not install a global Wrangler or use an unpinned `npx wrangler@latest` for this project. `npm exec -- wrangler ...` uses the dependency installed from this repository's lockfile. The `--` separates npm's arguments from Wrangler's arguments.

Check versions and local behavior:

```sh
npm exec -- astro --version
npm exec -- wrangler --version
npm run check
npm test
npm run build
npm run preview:cloudflare -- --ip=127.0.0.1 --port=8788
```

Open the address printed by Wrangler. Stop it with Ctrl+C before reinstalling dependencies: Wrangler writes temporary files inside node_modules while running. This is a local runtime test, not a deployment. It does not exercise Access, DNS, account permissions, or uploads.

## 3. Put the project in a private GitHub repository

Create an empty private repository on GitHub without an initial README/license. From this repository's root, if it does not already have Git:

```sh
git init -b main
git add .
git commit -m "Set up Astro blog"
git remote add origin https://github.com/YOUR_USERNAME/emmanuel-blog.git
```

If you already have a Git repository, preserve its history and existing remotes; inspect `git status` and `git remote -v` instead of reinitializing or adding a duplicate origin.

Hold the first push until you have configured Cloudflare and the GitHub settings below. The included workflow deploys on pushes to main and canary.

Keep the repository private because drafts and editable diagrams live in it. Access protects the hosted preview; it cannot make a public Git branch private.

## 4. Authenticate and explicitly create the Pages project

```sh
npm exec -- wrangler login
npm exec -- wrangler whoami
```

Complete the login in your browser, then verify the account shown by `whoami`. Login is interactive; GitHub Actions will use a scoped API token instead.

If a Pages project already exists in your account, list projects and reuse its exact name:

```sh
npm exec -- wrangler pages project list
```

Otherwise create it once, replacing `YOUR_PROJECT` with your chosen name:

```sh
npm exec -- wrangler pages project create YOUR_PROJECT --production-branch=main
```

The explicit project name and production branch are intentional. The installed CLI's help marks the name as required. Do not rely on the old guide's argument-free prompt behavior.

You can check syntax without creating anything:

```sh
npm exec -- wrangler pages project create --help
npm exec -- wrangler pages deploy --help
```

Record the actual hostname Cloudflare returns. It may have a suffix if your preferred hostname is taken. The project name, account ID, and deployment hostname are distinct values.

If you created a Direct Upload project with the wrong production branch, the dashboard does not expose the normal Git branch controls. Follow the documented Update Project API procedure in [Direct Upload: production branch configuration](https://developers.cloudflare.com/pages/get-started/direct-upload/#production-branch-configuration), or create the intended new project before any domain cutover. Do not assume `--branch=main` changes the project's configured production branch.

## 5. Protect canary before sending drafts

In your Pages project, enable the preview Access policy under Settings → General. Complete Zero Trust setup on the Free plan if prompted.

Inspect the resulting Access application. It must cover every preview hostname under the actual Pages hostname, including the `canary` alias and hash-specific deployment URLs. It must not protect your public production hostname.

Configure one Allow policy for your exact email address. Enable an identity provider or one-time PIN login. Remove broader Allow or Bypass rules. Do not allow “Everyone,” all email addresses at a provider, or the one-time PIN login method by itself.

References:

- [Preview Access protection and aliases](https://developers.cloudflare.com/pages/configuration/preview-deployments/)
- [Access policy rules](https://developers.cloudflare.com/cloudflare-one/access-controls/policies/)
- [One-time PIN login](https://developers.cloudflare.com/cloudflare-one/integrations/identity-providers/one-time-pin/)

The repository currently has no published posts, so its first empty-site deployment can be used to test protection. If Cloudflare requires an initial deployment before showing the policy setting, deploy only this non-sensitive empty version and then configure Access:

```sh
npm run deploy:canary -- --project-name=YOUR_PROJECT
```

This script checks and builds before uploading, so it cannot accidentally reuse an older `dist/`. It deploys your local working tree, including uncommitted content. For normal releases, use the committed GitHub Actions workflow.

In a signed-out browser, test the canary alias, a hash-specific deployment URL, and a direct asset URL such as `/favicon.svg`. All must require authentication. Then authenticate with your allowed email and confirm the content loads. Only after these checks should you upload unpublished writing.

An unguessable address and `noindex` are not access control. Local Wrangler cannot prove that your account's Access policy works.

## 6. Configure GitHub Actions

Create a Cloudflare API token with Account → Cloudflare Pages → Edit, restricted to the account hosting this project. This permission is account-scoped; it can affect other Pages projects in that account. Do not grant DNS-edit permission just to upload static files.

In GitHub → repository Settings → Secrets and variables → Actions, set:

| Type | Name | Value |
| --- | --- | --- |
| Secret | `CLOUDFLARE_API_TOKEN` | Scoped Pages deployment token |
| Variable | `CLOUDFLARE_ACCOUNT_ID` | Account ID containing the project |
| Variable | `CLOUDFLARE_PAGES_PROJECT` | Exact project name, not its hostname |
| Variable | `SITE_URL` | Intended public origin, e.g. `https://yourdomain.com` |

`SITE_URL` is optional before domain setup. When present it supplies canonical article URLs at build time. Use the production origin even on canary. It is not a credential.

The committed `.github/workflows/deploy.yml`:

1. Checks out the requested revision.
2. Selects Node from `.nvmrc`.
3. Installs the lockfile with `npm ci`.
4. Runs Astro diagnostics and regression tests.
5. Builds the website.
6. Uploads `dist/` with the pinned Wrangler CLI, passing the project name and actual branch explicitly.

Pull requests run checks without deployment credentials. Pushes to canary deploy previews. Pushes to main publish production. Manual runs can deploy main/canary, but other branches only build. Canary runs can supersede older canary runs; production is serialized without cancelling a running publication.

No extra Cloudflare Git integration or wrangler-action is needed; the CLI is already locked in this project's dependencies. GitHub's token only needs repository read access because this workflow doesn't create GitHub Deployment records.

After all settings are ready, pushing main publishes the current empty site:

```sh
git push -u origin main
```

Check GitHub's Actions log and Cloudflare's deployment result. Build success alone is not upload success. The official [Direct Upload CI guide](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/) documents the token and upload mechanism.

## 7. Connect your domain

In Pages → Custom domains, add the intended public hostname. Do this before adding a CNAME manually.

For an apex such as `yourdomain.com`, Cloudflare Pages requires the domain to be a Cloudflare DNS zone. Add the zone, preserve existing DNS records (including email MX/TXT records), and update nameservers at your registrar to Cloudflare's assigned values. Domain registration can remain with your current registrar.

For `blog.yourdomain.com`, you may retain another DNS provider and create the CNAME Cloudflare specifies after registering the hostname with Pages. Wait for both domain activation and HTTPS provisioning.

Set the GitHub `SITE_URL` variable to the final origin and rerun the main workflow so canonical URLs use it. Verify production is publicly readable and canary remains protected. Initially leave canary on its Pages alias; a custom canary hostname requires separate authentication coverage.

Reference: [Pages custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/).

## 8. Normal writing and release loop

Create the canary branch once:

```sh
git switch main
git pull --ff-only
git switch -c canary
```

For subsequent posts, switch to the existing branch and bring in main:

```sh
git switch canary
git merge main
```

Write posts as explained in [WRITING.md](WRITING.md), then:

```sh
npm run check
npm test
npm run build
git add src/content/blog drawings
git commit -m "Write about backpressure"
git push -u origin canary
```

Review the authenticated preview after Actions succeeds. Check the matching commit, text, diagrams, code blocks, and mobile layout. Open a GitHub pull request from canary into main. Review the entire diff and use “Create a merge commit”; retain the long-lived canary branch.

Merging publishes all changes in that branch. For concurrent independent articles, use separate branches and deliberately extend the preview workflow; it currently deploys only canary and main. Direct pushes to main also publish. This workflow does not claim to enforce a review gate; add repository rules if your GitHub plan supports the policy you want.

After merging:

```sh
git switch main
git pull --ff-only
git switch canary
git merge main
git push origin canary
```

A production release rebuilds the merged source; it does not promote the exact canary artifact. There is no external content fetch in this build. If byte-for-byte artifact promotion becomes a requirement, add an explicit artifact-based release workflow rather than treating a rebuild as equivalent.

## 9. Roll back

For urgent recovery, roll back to a known-good production deployment in Pages. Then revert or fix the corresponding Git change so a later deployment does not reintroduce it. A hosting rollback does not change repository history. [Pages rollbacks](https://developers.cloudflare.com/pages/configuration/rollbacks/)

For a bad merge commit on main, after checking the commit and its parents:

```sh
git switch main
git pull --ff-only
git revert -m 1 BAD_MERGE_COMMIT_SHA
git push origin main
```

For an ordinary commit, omit `-m 1`. Do not force-push history just to undo published content.

## 10. Troubleshooting

| Symptom | Check or fix |
| --- | --- |
| `EBADENGINE`, Node unsupported, missing Node APIs | `node --version`; select Node 24 and rerun `npm ci` |
| Project name required / no prompt | Supply the positional name: `npm exec -- wrangler pages project create YOUR_PROJECT --production-branch=main` |
| `Missing entry-point` or Worker configuration requested | You probably ran `wrangler deploy`; use `wrangler pages deploy dist` |
| Not authenticated | `npm exec -- wrangler login`, then `npm exec -- wrangler whoami`; CI needs its token secret |
| Project not found | Confirm account ID and project name, not a Pages hostname; list projects in the authenticated account |
| Preview updates public site | Confirm the project's production branch is main and the upload uses `--branch=canary` |
| Stale local preview | Run `npm run build` again; `preview` and `preview:cloudflare` serve existing output |
| Broken local image | Check case-sensitive filename and relative Markdown path; use `/...` only for assets deliberately under `public/` |
| Unknown metadata error | Check `src/content.config.ts`, valid ISO dates, and integer reading minutes |
| CI succeeds but custom domain fails | Check domain activation/DNS/HTTPS separately; upload success is not DNS success |
| Private content accessible via an asset/hash URL | Fix Access hostname coverage before uploading more drafts |

See [VERIFICATION.md](VERIFICATION.md) for the exact scope tested during this migration. Account authentication, remote upload, DNS, and Access cannot be inferred from a successful local build.
