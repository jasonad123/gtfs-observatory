import type { 
  DCAgency, 
  MobilityDataFeed, 
  GtfsFeed,
  GtfsRTFeed,
  ProcessedFeed,
  EntityType
} from './types';
import { createClient } from './mobilitydata';

export const DC_AGENCIES = [
  {
    id: 'wmata',
    name: 'WMATA',
    slug: 'wmata',
    website: 'https://www.wmata.com',
    providers: ['Washington Metropolitan Area Transit Authority']
  },
  {
    id: 'art',
    name: 'ART',
    slug: 'art',
    website: 'https://www.arlingtontransit.com',
    providers: ['Arlington Transit']
  },
  {
    id: 'cue',
    name: 'CUE',
    slug: 'cue',
    website: 'https://www.fairfaxva.gov/Services/CUE-Bus',
    providers: ['City of Fairfax CUE']
  },
  {
    id: 'dash',
    name: 'DASH',
    slug: 'dash',
    website: 'https://www.dashbus.com',
    providers: ['City of Alexandria DASH']
  },
  {
    id: 'fairfax-connector',
    name: 'Fairfax Connector',
    slug: 'fairfax-connector',
    website: 'https://www.fairfaxcounty.gov/connector/',
    providers: ['Fairfax Connector']
  },
  {
    id: 'loudoun',
    name: 'Loudoun County Transit',
    slug: 'loudoun',
    website: 'https://www.loudoun.gov/transit',
    providers: ['Loudoun County Transit']
  },
  {
    id: 'vre',
    name: 'VRE',
    slug: 'vre',
    website: 'https://www.vre.org',
    providers: ['Virginia Railway Express']
  },
  {
    id: 'omniride',
    name: 'OmniRide',
    slug: 'omniride',
    website: 'https://www.loudoun.gov/transit',
    providers: ['OmniRide']
  },
  {
    id: 'ride-on',
    name: 'Ride On',
    slug: 'ride-on',
    website: 'https://www.montgomerycountymd.gov/dot-transit/',
    providers: ['Ride On']
  },
  {
    id: 'thebus',
    name: 'TheBus',
    slug: 'thebus',
    website: 'https://www.princegeorgescountymd.gov/departments-offices/public-works-transportation/metro-and-transportation/prince-georges-countys-thebus',
    providers: ['Prince George\'s County THE BUS']
  },
  {
    id: 'marc',
    name: 'MARC',
    slug: 'marc',
    website: 'https://www.mta.maryland.gov/marc',
    providers: ['Maryland Transit Administration']
  },
  {
    id: 'mta-commuter',
    name: 'MTA Commuter Bus',
    slug: 'mta-commuter',
    website: 'https://www.mta.maryland.gov/schedule?type=commuter-bus',
    providers: ['Maryland Transit Administration']
  },

];

function isGtfsFeed(feed: MobilityDataFeed): feed is GtfsFeed {
  return feed.data_type === 'gtfs';
}

function isGtfsRTFeed(feed: MobilityDataFeed): feed is GtfsRTFeed {
  return feed.data_type === 'gtfs_rt';
}

function processFeed(feed: MobilityDataFeed): ProcessedFeed {
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

function determineAgencyStatus(feeds: ProcessedFeed[]): DCAgency['overallStatus'] {
  if (feeds.length === 0) return 'unknown';
  
  const hasError = feeds.some(f => f.status === 'inactive' || f.status === 'deprecated');
  if (hasError) return 'error';
  
  const hasDevelopment = feeds.some(f => f.status === 'development');
  if (hasDevelopment) return 'issues';
  
  const allActive = feeds.every(f => f.status === 'active');
  if (allActive) return 'healthy';
  
  return 'issues';
}

export async function getDCFeeds(): Promise<DCAgency[]> {
  const client = createClient();
  const feedsById = new Map<string, MobilityDataFeed>();
  
  // First, fetch feeds by ID if specified
  for (const agencyDef of DC_AGENCIES) {
    if (agencyDef.feedIds && agencyDef.feedIds.length > 0) {
      for (const feedId of agencyDef.feedIds) {
        try {
          const feed = await client.getFeedById(feedId);
          feedsById.set(feedId, feed);
        } catch (error) {
          console.error(`Failed to fetch feed ${feedId}:`, error);
        }
      }
    }
  }

  // Then fetch GTFS and GTFS-RT feeds for DC region
  const allFeeds: MobilityDataFeed[] = [...feedsById.values()];
  
  // Fetch GTFS feeds
  try {
    let offset = 0;
    const limit = 100;
    let hasMore = true;

    while (hasMore) {
      const gtfsFeeds = await client.getGtfsFeeds({
        limit,
        offset,
        country_code: 'US',
      });
      
      // Filter to DC region
      const dcGtfsFeeds = gtfsFeeds.filter(feed => {
        // Skip if already fetched by ID
        if (feedsById.has(feed.id)) return false;
        
        if (!feed.locations || feed.locations.length === 0) {
          return DC_AGENCIES.some(agency => 
            agency.providers.some(p => feed.provider.includes(p))
          );
        }
        
        return feed.locations.some(loc => 
          loc.subdivision_name === 'District of Columbia' ||
          loc.subdivision_name === 'Virginia' ||
          loc.subdivision_name === 'Maryland'
        );
      });
      
      allFeeds.push(...dcGtfsFeeds);
      offset += limit;
      hasMore = gtfsFeeds.length === limit;
    }
  } catch (error) {
    console.error('Failed to fetch GTFS feeds:', error);
  }

  // Fetch GTFS-RT feeds
  try {
    let offset = 0;
    const limit = 100;
    let hasMore = true;

    while (hasMore) {
      const gtfsRtFeeds = await client.getGtfsRtFeeds({
        limit,
        offset,
        country_code: 'US',
      });
      
      // Filter to DC region
      const dcGtfsRtFeeds = gtfsRtFeeds.filter(feed => {
        // Skip if already fetched by ID
        if (feedsById.has(feed.id)) return false;
        
        if (!feed.locations || feed.locations.length === 0) {
          return DC_AGENCIES.some(agency => 
            agency.providers.some(p => feed.provider.includes(p))
          );
        }
        
        return feed.locations.some(loc => 
          loc.subdivision_name === 'District of Columbia' ||
          loc.subdivision_name === 'Virginia' ||
          loc.subdivision_name === 'Maryland'
        );
      });
      
      allFeeds.push(...dcGtfsRtFeeds);
      offset += limit;
      hasMore = gtfsRtFeeds.length === limit;
    }
  } catch (error) {
    console.error('Failed to fetch GTFS-RT feeds:', error);
  }

  // Build agencies with matched feeds
  const agencies: DCAgency[] = DC_AGENCIES.map(agencyDef => {
    const agencyFeeds = allFeeds
      .filter(feed => {
        // Match by ID first (most reliable)
        if (agencyDef.feedIds && agencyDef.feedIds.includes(feed.id)) {
          return true;
        }
        // Fall back to provider name matching
        return agencyDef.providers.some(p => feed.provider.includes(p));
      })
      .map(processFeed);

    return {
      id: agencyDef.id,
      name: agencyDef.name,
      slug: agencyDef.slug,
      website: agencyDef.website,
      feedIds: agencyDef.feedIds,
      feeds: agencyFeeds,
      overallStatus: determineAgencyStatus(agencyFeeds)
    };
  }).filter(agency => agency.feeds.length > 0);

  return agencies;
}