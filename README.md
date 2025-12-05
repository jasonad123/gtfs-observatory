# DC GTFS Dashboard

A real-time dashboard for monitoring GTFS and GTFS-RT feeds across the Washington DC metropolitan area. Built with Astro and powered by the MobilityData Mobility Database API.

## Features

- Single-page dashboard with agency cards
- Modal pop-ups for detailed feed information
- Support for both GTFS Schedule and GTFS Realtime feeds
- Download options for both MobilityData-hosted and agency-direct feeds
- Real-time status monitoring
- Responsive design using Pico CSS

## Prerequisites

- Node.js 18 or higher
- A MobilityData account with API credentials

## Setup

### 1. Clone or Download

If you received this as a directory, navigate to it. Otherwise, extract the files.

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and add your MobilityData API refresh token:

```
MOBILITY_API_KEY=your_refresh_token_here
```

To get your refresh token:
1. Visit https://mobilitydatabase.org
2. Create a free account
3. Navigate to Account Details
4. Copy your refresh token

### 4. Run Development Server

```bash
pnpm run dev
```

The dashboard will be available at http://localhost:4321

## Project Structure

```
dc-gtfs-dashboard/
├── src/
│   ├── components/          # Reusable Astro components
│   │   ├── AgencyCard.astro
│   │   └── AgencyModal.astro
│   ├── layouts/             # Page layouts
│   │   └── DashboardLayout.astro
│   ├── lib/                 # Business logic and utilities
│   │   ├── agencies.ts      # DC agency definitions and feed processing
│   │   ├── mobilitydata.ts  # MobilityData API client
│   │   └── types.ts         # TypeScript type definitions
│   ├── pages/               # Routes
│   │   └── index.astro      # Main dashboard page
│   ├── scripts/             # Client-side scripts
│   │   └── modal.ts         # Modal interaction logic
│   └── styles/              # Global styles
│       └── global.css
├── public/                  # Static assets
│   └── agency-logos/        # Place agency logos here
├── data/                    # Data storage (optional)
└── package.json
```

## How It Works

### Data Flow

1. At build time, the dashboard fetches all feeds from the MobilityData API
2. Feeds are filtered to the DC metropolitan region
3. Feeds are grouped by transit agency
4. The page is statically generated with all feed information
5. Modal interactions are handled client-side with vanilla JavaScript

### Agency Configuration

DC area agencies are defined in `src/lib/agencies.ts`. Each agency includes:
- ID and display name
- Website URL
- Feed IDs (MobilityData IDs in mdb-xxx format) - preferred for precise matching
- Provider name mappings (used as fallback when feed IDs not available)

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
  feedIds: ['mdb-123', 'mdb-456'], // Optional but recommended
  providers: ['Official Provider Name in MobilityData'] // Fallback
}
```

**Finding Feed IDs**:
1. Visit https://mobilitydatabase.org
2. Search for your agency
3. Note the feed ID(s) from the feed details or URL (format: mdb-xxx)
4. Add to the `feedIds` array in agency configuration

### Feed Processing

The `getDCFeeds()` function:
1. Fetches all US feeds from MobilityData
2. Filters by DC region (Virginia, Maryland, District of Columbia)
3. Matches feeds to known DC agencies
4. Processes feed metadata for display
5. Groups feeds by agency with status indicators

## Building for Production

```bash
pnpm run build
```

The static site will be generated in the `dist/` directory.

## Deployment

This is a static site and can be deployed to:

- Cloudflare Pages
- Netlify
- Vercel
- GitHub Pages
- Any static hosting service

### Cloudflare Pages (Recommended)

1. Connect your repository to Cloudflare Pages
2. Set build command: `pnpm run build`
3. Set output directory: `dist`
4. Add environment variable: `MOBILITY_API_KEY`
5. Configure automatic rebuilds (recommended: every 6-24 hours)

### Scheduled Builds

To keep feed data current, set up scheduled rebuilds:

- Cloudflare: Use Cron Triggers
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
- Feed quality metrics and scoring
- Service alert aggregation
- RSS feeds for monitoring
- Email notifications for feed issues

## MobilityData API

This project uses the MobilityData Mobility Database API:
- Docs: https://github.com/MobilityData/mobility-feed-api
- Database: https://mobilitydatabase.org

API Rate Limits:
- Non-cached requests: 100/hour per user
- Cached/repeated requests: More lenient

## Covered Transit Agencies

Current scope includes:

- WMATA (Metrorail + Metrobus)
- ART (Arlington Transit)
- CUE (City of Fairfax)
- DASH (Alexandria)
- Fairfax Connector (Fairfax County)
- Loudoun County Transit
- OmniRide (Prince William County)
- Ride On (Montgomery County)
- VRE (Virginia Railway Express)
- TheBus (Prince George's County)
- MARC
- MTA Maryland Commuer Bus


## Troubleshooting

### "Unable to Load Feeds" Error

Check:
1. Environment variable is set correctly in `.env`
2. MobilityData API is accessible
3. Your refresh token is valid (check account settings)
4. Network connectivity

### No Feeds Showing

Possible causes:
1. Agency provider names don't match MobilityData records
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
pnpm run preview
```

## License

This project is open source. Individual GTFS feeds are subject to their respective data providers' terms and conditions.

## Contributing

Contributions welcome! Areas for improvement:

- Additional DC area agencies
- Better validation result display
- Historical trend tracking
- Real-time feed health monitoring
- Agency logo integration

## Acknowledgments

- MobilityData for maintaining the Mobility Database
- Transit agencies for providing open data
- Pico CSS for minimal styling framework
