# GTFS Observatory

A *semi*-real-time dashboard for monitoring GTFS and GTFS-RT feeds.
Built with Astro and powered by the MobilityData Mobility Database API.

## Features

- Single-page dashboard with agency cards
- Modal pop-ups for detailed feed information
- Support for both GTFS Schedule and GTFS Realtime feeds
- Download options for both Mobility Database-hosted and agency-direct feeds
- Semi-real-time status monitoring
- Responsive design using Pico CSS

## Prerequisites

- Node.js 18 or higher
- A Mobility Database account with API credentials

## Setup

### 1. Clone or Download

If you received this as a directory, navigate to it. Otherwise, extract the files.

```bash
https://github.com/jasonad123/gtfs-observatory.git

cd gtfs-observatory
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and add your Mobility Database API refresh token:

```bash
MOBILITY_API_KEY=your_refresh_token_here
```

To get your refresh token:

1. Visit https://mobilitydatabase.org
2. Create a free account
3. Navigate to Account Details
4. Copy your refresh token

### 4. Run Development Server

```bash
pnpm dev
```

The dashboard will be available at http://localhost:4321

## Project Structure

```
dc-gtfs-dashboard/
├── src/
│   └── assets/              # Assets - these will be transformed by Astro at build time
│   │   ├── agency-logos     # Load all agency logos here
│   ├── components/          # Reusable Astro components
│   │   ├── AgencyCard.astro
│   │   └── AgencyModal.astro
│   ├── layouts/             # Page layouts
│   │   └── DashboardLayout.astro
│   ├── lib/                 # Business logic and utilities
│   │   ├── agencies.ts      # transit agency definitions and feed processing
│   │   ├── mobilitydata.ts  # MobilityData API client
│   │   └── types.ts         # TypeScript type definitions
│   ├── pages/               # Routes
│   │   └── index.astro      # Main dashboard page
│   │   └── faq.astro        # FAQ page
│   ├── scripts/             # Client-side scripts
│   │   └── modal.ts         # Modal interaction logic
│   └── styles/              # Global styles
│       └── global.css
├── public/                  # Static assets
│   └── icons/               # Various icons
├── data/                    # Data storage (optional)
└── package.json
```

## How It Works

### Data Flow

1. At build time, the dashboard fetches all feeds from the MobilityData API
2. Feeds are filtered to the region (in this case the DC metro area)
3. Feeds are grouped by transit agency
4. The page is statically generated with all feed information
5. Modal interactions are handled client-side with vanilla JavaScript

### Agency Configuration

Agencies are defined in `src/lib/agencies.ts`. Each agency includes:

- ID and display name
- Website URL
- Feed IDs (Mobility Database IDs in mdb-xxx format) - preferred for precise matching
- Provider name mappings (used as fallback when feed IDs not available)
- (optional) Colours and logo for branding purposes

**Feed Matching Strategy**:

1. **Primary**: Match by MobilityData feed ID (most reliable)
2. **Fallback**: Match by provider name (if IDs not specified)

To add a new agency:

```typescript
{
  id: 'agency-slug',
  name: 'Agency Display Name',
  slug: 'agency-slug',
  website: 'https://agency-website.com',
  logo: 'logo.svg', // Optional - logos *must* be placed in src/assets/agency-logos
  showName: false, // Optional - if using a logo 'true' keeps the text name, 'false' hides text and just shows the logo
  color: '#1c335f', // Optional
  secondaryColor: '#308c26', // Optional
  textColor: '#ffffff', // Optional
  gtfsFeedIds: ['mdb-123'], // Optional but recommended
  gtfsRtFeedIds: ['mdb-1234'], // Optional but recommended
  providers: ['Official Provider Name in MobilityData'] // Fallback
}
```

**Finding Feed IDs**:

1. Visit https://mobilitydatabase.org
2. Search for your agency
3. Note the feed ID(s) from the feed details or URL (format: mdb-xxx or tld-xxx)
4. Add to the `gtfsFeedIds` or `gtfsRtFeedIds` array in agency configuration

### Feed Processing

The `getDCFeeds()` function:

1. Fetches all US feeds from MobilityData
2. Filters by region (currently set to District of Columbia, Maryland, Virginia)
3. Matches feeds to known regional agencies
4. Processes feed metadata for display
5. Groups feeds by agency with status indicators

## Building for Production

```bash
pnpm build
```

The static site will be generated in the `dist/` directory.

## Deployment

This is a static site and can be deployed to:

- Cloudflare Pages
- Cloudflare Workers
- Netlify
- Vercel
- GitHub Pages
- Any static hosting service

### Cloudflare Pages (Recommended)

1. Connect your repository to Cloudflare Pages
2. Set build command: `pnpm run build`
3. Set output directory: `dist`
4. Add environment variable: `MOBILITY_API_KEY`
5. Configure automatic rebuilds (recommended: every 6-24 hours) using Deploy Hooks

### Scheduled Builds

To keep feed data current, set up scheduled rebuilds:

- Cloudflare Pages: Use Deploy Hooks
- Cloudflare Workers: Use Trigger Events
- Netlify: Use Build Hooks with external cron service
- GitHub Actions: Use scheduled workflows

Example frequency: Every 6 hours during business hours

## Customization

### Styling

The dashboard uses Pico CSS for minimal, semantic styling. To customize:

1. Override Pico CSS variables in `src/styles/global.css`
2. Modify component styles in individual `.astro` files
3. Add custom CSS classes as needed

### Adding Features

Potential enhancements:

- Historical validation tracking (store results in Git or database)
- GTFS-RT proxy endpoints (use Astro server endpoints)

## MobilityData API

This project uses the MobilityData Mobility Database API:

- Docs: https://github.com/MobilityData/mobility-feed-api
- Catalogs repo: https://github.com/MobilityData/mobility-database-catalogs
- Database: https://mobilitydatabase.org

API Rate Limits:

- Non-cached requests: 100/hour per user
- Cached/repeated requests: More lenient

## Troubleshooting

### "Unable to Load Feeds" Error

Check:

1. Environment variable is set correctly in `.env`
2. Mobility Database API is accessible
3. Your refresh token is valid (check account settings)
4. Network connectivity

### No Feeds Showing

Possible causes:

1. Agency provider names don't match Mobility Database records
2. Feed locations aren't properly tagged in the database
3. All feeds are marked as inactive

### Modal Not Opening

Check browser console for JavaScript errors. Ensure:

1. Modal script is properly imported
2. Agency IDs match between cards and modals
3. Dialog element is supported (modern browsers)

## Development

### Type Checking

```bash
pnpm run astro check
```

### Preview Production Build

```bash
pnpm build
pnpm preview
```

## License

This project is open source. Individual GTFS feeds are subject to their respective data providers' terms and conditions.

## Contributing

Contributions welcome! Potential TODOs include:

- Real-time feed health monitoring

## Acknowledgments

- [MobilityData](https://mobilitydata.org) for maintaining the Mobility Database
- Transit agencies for providing open data
- [Pico CSS](https://picocss.com/) for minimal styling framework
- [Siemens](https://ix.siemens.io/) for providing icons from the iX design system

## Disclaimers
> [!NOTE]
> **Generative AI:** The code for this project was developed with the help of generative AI tools, including Claude and Claude Code. While all outputs have been *lovingly* reviewed and tested, users should validate results independently before use in production environments.
