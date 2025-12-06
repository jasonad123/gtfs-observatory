import type {
  TransitAgency,
  MobilityDataFeed,
  GtfsFeed,
  GtfsRTFeed,
  ProcessedFeed,
  EntityType
} from './types';
import { createClient } from './mobilitydata';

export interface AgencyDefinition {
  id: string;
  name: string;
  slug: string;
  website?: string;
  logo?: string; // Path to logo in src/assets/agency-logos/ (e.g., 'WMATA_Logo_2025.svg')
  color?: string;
  secondaryColor?: string;
  textColor?: string;
  showName?: boolean; // Whether to display agency name text on card (defaults to true)
  gtfsFeedIds?: string[];
  gtfsRtFeedIds?: string[];
  providers: string[];
}

// Region filtering configuration
// To customize for your region:
// 1. Update subdivisions to match your state/province names as they appear in Mobility Database
// 2. Update countryCodes to your country (e.g., ['CA'] for Canada, ['US', 'CA'] for both)
// 3. Note: Feeds are matched if EITHER location OR provider matches (see isInRegion function)
export const REGION_CONFIG = {
  subdivisions: ['District of Columbia', 'Virginia', 'Maryland'] as string[],
  countryCodes: ['US'] as string[]
};

export const TRANSIT_AGENCIES: AgencyDefinition[] = [
  {
    id: 'wmata',
    name: 'WMATA',
    slug: 'wmata',
    website: 'https://www.wmata.com',
    logo: 'WMATA_Logo_2025.svg',
    gtfsFeedIds: [],
    gtfsRtFeedIds: [],
    providers: ['Washington Metropolitan Area Transit Authority']
  },
  {
    id: 'art',
    name: 'ART',
    slug: 'art',
    website: 'https://www.arlingtontransit.com',
    logo: 'art.svg',
    showName: false,
    color: '#006641', 
    textColor: '#ffffff',
    gtfsFeedIds: [],
    gtfsRtFeedIds: [],
    providers: ['Arlington Transit']
  },
  {
    id: 'cue',
    name: 'CUE',
    slug: 'cue',
    website: 'https://www.fairfaxva.gov/Services/CUE-Bus',
    color: '#015c8d', 
    secondaryColor: '#4fc0a9',
    textColor: '#ffffff',
    gtfsFeedIds: [],
    gtfsRtFeedIds: [],
    providers: ['Fairfax CUE Bus (CUE)', 'Fairfax CUE Bus']
  },
  {
    id: 'dash',
    name: 'DASH',
    slug: 'dash',
    website: 'https://www.dashbus.com',
    color: '#0257a3',
    textColor: '#ffffff',
    gtfsFeedIds: [],
    gtfsRtFeedIds: ['mdb-2843', 'mdb-2844', 'mdb-2845'],
    providers: ['Alexandria Transit Company (DASH)', 'Alexandria Transit Company']
  },
  {
    id: 'fairfax-connector',
    name: 'Fairfax Connector',
    slug: 'fairfax-connector',
    website: 'https://www.fairfaxcounty.gov/connector/',
    color: '#e63c2f', 
    textColor: '#ffffff',
    gtfsFeedIds: [],
    gtfsRtFeedIds: [],
    providers: ['Fairfax Connector']
  },
  {
    id: 'loudoun',
    name: 'Loudoun County Transit',
    slug: 'loudoun',
    website: 'https://www.loudoun.gov/transit',
    color: '#b82d36', 
    textColor: '#ffffff',
    gtfsFeedIds: [],
    gtfsRtFeedIds: [],
    providers: ['Loudoun County Transit']
  },
  {
    id: 'vre',
    name: 'VRE',
    slug: 'vre',
    website: 'https://www.vre.org',
    logo: 'vre.svg',
    showName: false,
    color: '#df393e',
    secondaryColor: '#004785',
    textColor: '#ffffff',
    gtfsFeedIds: ['tld-61'],
    gtfsRtFeedIds: ['tld-1127-vp', 'tld-1127-tu'],
    providers: ['Virginia Railway Express', 'Virginia Railway Express (VRE)']
  },
  {
    id: 'omniride',
    name: 'OmniRide',
    slug: 'omniride',
    website: 'https://omniride.com/',
    color: '#68a51d',
    secondaryColor: '#015fa5',
    textColor: '#ffffff',
    gtfsFeedIds: [],
    gtfsRtFeedIds: [],
    providers: ['Potomac and Rappahannock Transportation Commission (PRTC) Omniride']
  },
  {
    id: 'ride-on',
    name: 'Ride On',
    slug: 'ride-on',
    website: 'https://www.montgomerycountymd.gov/dot-transit/',
    color: '#0079c2', 
    textColor: '#ffffff',
    gtfsFeedIds: [],
    gtfsRtFeedIds: [],
    providers: ['Ride On']
  },
  {
    id: 'thebus',
    name: 'TheBus',
    slug: 'thebus',
    website: 'https://www.princegeorgescountymd.gov/departments-offices/public-works-transportation/metro-and-transportation/prince-georges-countys-thebus',
    color: '#f8cb4c', 
    textColor: '#243c7e',
    gtfsFeedIds: ['mdb-477'],
    gtfsRtFeedIds: [],
    providers: ['Prince George\'s County (The Bus)']
  },
  {
    id: 'marc',
    name: 'MARC',
    slug: 'marc',
    website: 'https://www.mta.maryland.gov/marc',
    logo: 'marc.svg',
    showName: false,
    color: '#ffffff', 
    secondaryColor: '#F27428',
    textColor: '#ffffff',
    gtfsFeedIds: ['mdb-468'],
    gtfsRtFeedIds: ['mdb-1619'],
    providers: ['MARC']
  },
  {
    id: 'mta-commuter',
    name: 'MTA Commuter Bus',
    slug: 'mta-commuter',
    website: 'https://www.mta.maryland.gov/schedule?type=commuter-bus',
    color: '#ffc233',
    secondaryColor: '#a5272d',
    textColor: '#212121',
    gtfsFeedIds: ['mdb-467'],
    gtfsRtFeedIds: ['tld-4921-sa'],
    providers: []
  },

];

function isGtfsFeed(feed: MobilityDataFeed): feed is GtfsFeed {
  return feed.data_type === 'gtfs';
}

function isGtfsRTFeed(feed: MobilityDataFeed): feed is GtfsRTFeed {
  return feed.data_type === 'gtfs_rt';
}

function processFeed(feed: MobilityDataFeed): ProcessedFeed {
  // Skip GBFS feeds - we only handle GTFS and GTFS-RT
  if (feed.data_type === 'gbfs') {
    throw new Error('GBFS feeds are not supported in this application');
  }

  const baseFeed: ProcessedFeed = {
    id: feed.id,
    type: feed.data_type,
    name: feed.feed_name || `${feed.provider} ${feed.data_type.toUpperCase()}`,
    status: feed.status,
    downloadUrls: {},
    official: feed.official,
    note: feed.note,
  };

  // Add authentication info if present
  if (feed.source_info?.authentication_type) {
    baseFeed.authentication = {
      type: feed.source_info.authentication_type,
      infoUrl: feed.source_info.authentication_info_url,
      parameterName: feed.source_info.api_key_parameter_name,
    };
  }

  // Add license info if present
  if (feed.source_info?.license_id || feed.source_info?.license_url) {
    baseFeed.license = {
      id: feed.source_info.license_id,
      url: feed.source_info.license_url,
      isSpdx: feed.source_info.license_is_spdx,
    };
  }

  // Add locations if present
  if (feed.locations && feed.locations.length > 0) {
    baseFeed.locations = feed.locations;
  }

  // GTFS-specific processing
  if (isGtfsFeed(feed)) {
    if (feed.latest_dataset) {
      baseFeed.downloadUrls.mobilityData = feed.latest_dataset.hosted_url;
      baseFeed.lastUpdated = feed.latest_dataset.downloaded_at;
      baseFeed.validation = feed.latest_dataset.validation_report;
      baseFeed.datasetId = feed.latest_dataset.id;
    }
    if (feed.source_info?.producer_url) {
      baseFeed.downloadUrls.direct = feed.source_info.producer_url;
    }
    if (feed.bounding_box) {
      baseFeed.boundingBox = feed.bounding_box;
    }
  }

  // GTFS-RT specific processing
  if (isGtfsRTFeed(feed)) {
    if (feed.entity_types && feed.entity_types.length > 0) {
      baseFeed.realtimeTypes = feed.entity_types as EntityType[];
    }
    if (feed.source_info?.producer_url) {
      baseFeed.downloadUrls.direct = feed.source_info.producer_url;
    }
    if (feed.feed_references && feed.feed_references.length > 0) {
      baseFeed.feedReferences = feed.feed_references;
    }
  }

  return baseFeed;
}

function determineAgencyStatus(feeds: ProcessedFeed[]): TransitAgency['overallStatus'] {
  if (feeds.length === 0) return 'unknown';

  // Only treat inactive as error (deprecated feeds are filtered out earlier)
  const hasError = feeds.some(f => f.status === 'inactive');
  if (hasError) return 'error';

  const hasDevelopment = feeds.some(f => f.status === 'development');
  if (hasDevelopment) return 'issues';

  const allActive = feeds.every(f => f.status === 'active');
  if (allActive) return 'healthy';

  // If all feeds are deprecated (edge case where no active feeds exist)
  const allDeprecated = feeds.every(f => f.status === 'deprecated');
  if (allDeprecated) return 'issues';

  return 'issues';
}

function isInRegion(feed: MobilityDataFeed): boolean {
  // Check if location matches configured subdivisions
  const hasMatchingLocation = feed.locations && feed.locations.length > 0 &&
    feed.locations.some(loc => REGION_CONFIG.subdivisions.includes(loc.subdivision_name || ''));

  // Check if provider matches any configured agency
  const hasMatchingProvider = TRANSIT_AGENCIES.some(agency =>
    agency.providers.length > 0 && agency.providers.some(p => feed.provider.includes(p))
  );

  // A feed is in region if EITHER location OR provider matches
  return hasMatchingLocation || hasMatchingProvider;
}

export async function getDCFeeds(): Promise<TransitAgency[]> {
  const client = createClient();
  const feedsById = new Map<string, MobilityDataFeed>();

  // First, fetch feeds by ID using type-specific endpoints
  for (const agencyDef of TRANSIT_AGENCIES) {
    // Fetch GTFS schedule feeds by ID
    if (agencyDef.gtfsFeedIds && agencyDef.gtfsFeedIds.length > 0) {
      for (const feedId of agencyDef.gtfsFeedIds) {
        try {
          const feed = await client.getGtfsFeedById(feedId);
          feedsById.set(feedId, feed);
        } catch (error) {
          console.error(`Failed to fetch GTFS feed ${feedId}:`, error);
        }
      }
    }

    // Fetch GTFS-RT feeds by ID
    if (agencyDef.gtfsRtFeedIds && agencyDef.gtfsRtFeedIds.length > 0) {
      for (const feedId of agencyDef.gtfsRtFeedIds) {
        try {
          const feed = await client.getGtfsRtFeedById(feedId);
          feedsById.set(feedId, feed);
        } catch (error) {
          console.error(`Failed to fetch GTFS-RT feed ${feedId}:`, error);
        }
      }
    }
  }

  // Then fetch GTFS and GTFS-RT feeds for configured region(s)
  const allFeeds: MobilityDataFeed[] = [...feedsById.values()];

  // Fetch GTFS feeds for each country code
  for (const countryCode of REGION_CONFIG.countryCodes) {
    try {
      let offset = 0;
      const limit = 100;
      let hasMore = true;

      while (hasMore) {
        const gtfsFeeds = await client.getGtfsFeeds({
          limit,
          offset,
          country_code: countryCode,
        });

        // Filter to configured region
        const regionalFeeds = gtfsFeeds.filter(feed => {
          // Skip if already fetched by ID
          if (feedsById.has(feed.id)) return false;
          return isInRegion(feed);
        });

        allFeeds.push(...regionalFeeds);
        offset += limit;
        hasMore = gtfsFeeds.length === limit;
      }
    } catch (error) {
      console.error(`Failed to fetch GTFS feeds for ${countryCode}:`, error);
    }
  }

  // Fetch GTFS-RT feeds for each country code
  for (const countryCode of REGION_CONFIG.countryCodes) {
    try {
      let offset = 0;
      const limit = 100;
      let hasMore = true;

      while (hasMore) {
        const gtfsRtFeeds = await client.getGtfsRtFeeds({
          limit,
          offset,
          country_code: countryCode,
        });

        // Filter to configured region
        const regionalFeeds = gtfsRtFeeds.filter(feed => {
          // Skip if already fetched by ID
          if (feedsById.has(feed.id)) return false;
          return isInRegion(feed);
        });
        allFeeds.push(...regionalFeeds);
        offset += limit;
        hasMore = gtfsRtFeeds.length === limit;
      }
    } catch (error) {
      console.error(`Failed to fetch GTFS-RT feeds for ${countryCode}:`, error);
    }
  }

  // Process all feeds
  const processedFeedsMap = new Map<string, ProcessedFeed>();
  for (const feed of allFeeds) {
    const processed = processFeed(feed);
    processedFeedsMap.set(feed.id, processed);
  }

  // Fetch fresh validation data for GTFS feeds with datasets
  for (const [feedId, processedFeed] of processedFeedsMap.entries()) {
    if (processedFeed.type === 'gtfs' && processedFeed.datasetId) {
      try {
        const dataset = await client.getGtfsDatasetById(processedFeed.datasetId);
        if (dataset.validation_report) {
          processedFeed.validation = dataset.validation_report;
        }
      } catch (error) {
        console.error(`Failed to fetch dataset ${processedFeed.datasetId} for feed ${feedId}:`, error);
      }
    }
  }

  // Build agencies with matched feeds
  const agencies: TransitAgency[] = TRANSIT_AGENCIES.map(agencyDef => {
    const matchedFeeds = allFeeds
      .filter(feed => {
        // Match by ID first (most reliable)
        const allFeedIds: string[] = [
          ...(agencyDef.gtfsFeedIds || []),
          ...(agencyDef.gtfsRtFeedIds || [])
        ];
        if (allFeedIds.length > 0 && allFeedIds.includes(feed.id)) {
          return true;
        }
        // Fall back to provider name matching
        return agencyDef.providers.length > 0 && agencyDef.providers.some(p => feed.provider.includes(p));
      })
      .map(feed => processedFeedsMap.get(feed.id)!);

    // Filter out deprecated feeds for status calculation and card display
    const nonDeprecatedFeeds = matchedFeeds.filter(f => f.status !== 'deprecated');
    const activeFeeds = nonDeprecatedFeeds.length > 0 ? nonDeprecatedFeeds : matchedFeeds;

    return {
      id: agencyDef.id,
      name: agencyDef.name,
      slug: agencyDef.slug,
      website: agencyDef.website,
      logo: agencyDef.logo,
      color: agencyDef.color,
      secondaryColor: agencyDef.secondaryColor,
      textColor: agencyDef.textColor,
      showName: agencyDef.showName,
      feedIds: [...(agencyDef.gtfsFeedIds || []), ...(agencyDef.gtfsRtFeedIds || [])],
      feeds: matchedFeeds, // Include ALL feeds (including deprecated) for the modal
      overallStatus: determineAgencyStatus(activeFeeds) // But calculate status from active feeds only
    };
  }).filter(agency => agency.feeds.length > 0);

  return agencies;
}