# Deployment Guide

This project is configured for deployment to both Cloudflare Pages and Netlify, with automated scheduled rebuilds to fetch fresh GTFS data daily.

## Cloudflare Pages (Primary)

### Initial Setup

1. Push your repository to GitHub
2. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
3. Go to Workers & Pages > Create application > Pages tab
4. Connect to your GitHub repository
5. Configure build settings:
   - Framework preset: **Astro**
   - Build command: `pnpm build`
   - Build output directory: `dist`
   - Node version: `20`

Cloudflare Pages will auto-detect Astro and configure most settings automatically.

### Scheduled Rebuilds

The GitHub Actions workflow (`.github/workflows/scheduled-rebuild.yml`) will automatically trigger daily rebuilds at 6 AM UTC by pushing an empty commit. Cloudflare Pages will detect the push and rebuild automatically.

No additional configuration needed - it works out of the box once the workflow is enabled.

## Netlify (Secondary/Parallel)

### Initial Setup

1. Log in to [Netlify](https://app.netlify.com)
2. Click "Add new site" > "Import an existing project"
3. Connect to your GitHub repository
4. Build settings are auto-configured from `netlify.toml`:
   - Build command: `pnpm build`
   - Publish directory: `dist`
   - Node version: `20`

### Scheduled Rebuilds (Optional)

To enable scheduled rebuilds on Netlify:

1. Go to Site settings > Build & deploy > Build hooks
2. Create a new build hook (e.g., "Scheduled GTFS Update")
3. Copy the build hook URL
4. Add it to your GitHub repository secrets:
   - Go to Settings > Secrets and variables > Actions
   - Create new secret: `NETLIFY_BUILD_HOOK`
   - Paste the build hook URL as the value

The GitHub Actions workflow will automatically trigger Netlify rebuilds when this secret is configured.

## GitHub Actions Permissions

The scheduled rebuild workflow requires write permissions:

1. Go to repository Settings > Actions > General
2. Scroll to "Workflow permissions"
3. Select "Read and write permissions"
4. Save

## Manual Rebuilds

You can manually trigger a rebuild at any time:

1. Go to Actions tab in your GitHub repository
2. Select "Scheduled Rebuild" workflow
3. Click "Run workflow"

## Environment Variables

Currently, no environment variables are required. All data is fetched from the public MobilityData API at build time.

## Monitoring

- Cloudflare Pages: View deployments at `https://dash.cloudflare.com`
- Netlify: View deployments at `https://app.netlify.com`
- GitHub Actions: View workflow runs in the Actions tab

## Custom Domain

Both platforms support custom domains:

- Cloudflare Pages: Custom domains > Add a custom domain
- Netlify: Domain settings > Add custom domain

Cloudflare Pages integrates seamlessly with Cloudflare DNS if you're using Cloudflare for domain management.
