## Next.js Fumadocs

View the Next.js docs with Fumadocs.
You can also use it to preview your pull request when contributing to the docs.

https://nextjs-fumadocs.vercel.app

### Preview in Development Mode

This example fetches content from Next.js repo using GitHub API, make sure to put your GitHub token in `.env.local` in `GITHUB_TOKEN` variable.

You can also preview content locally with:

```bash
pnpm sync:docs
pnpm dev:local
```

This will clone docs content from the Next.js repo, and store them at the `_docs_/docs` directory.
`dev:local` command will preview the docs using local file system instead of GitHub API.

### ISR in Production Mode

```bash
pnpm build
```

For production build, it clones the docs content from `vercel/next.js` repo, and pre-render them locally.
Once deployed/started in production mode, it will instead use GitHub API to fetch the latest docs content, no need to re-trigger another build for new content updates.
