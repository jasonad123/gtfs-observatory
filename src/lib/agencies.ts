import type { DCAgency, MobilityDataFeed, ProcessedFeed } from './types';
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

function processFeed(feed: MobilityDataFeed): ProcessedFeed {
  const isRealtime = feed.data_type === 'gtfs_rt';
  
  return {
    id: feed.id,
    type: feed.data_type,
    name: feed.feed_name || `${feed.provider} ${feed.data_type.toUpperCase()}`,
    status: feed.status,
    downloadUrls: {
      mobilityData: feed.latest?.hosted_url,
      direct: isRealtime ? feed.gtfs_rt?.url : feed.latest?.url
    },
    lastUpdated: feed.latest?.downloaded_at,
    realtimeTypes: feed.gtfs_rt?.entity_type
  };
}

function determineAgencyStatus(feeds: ProcessedFeed[]): DCAgency['overallStatus'] {
  if (feeds.length === 0) return 'unknown';
  
  const hasError = feeds.some(f => f.status === 'inactive' || f.status === 'deprecated');
  if (hasError) return 'error';
  
  const allActive = feeds.every(f => f.status === 'active');
  if (allActive) return 'healthy';
  
  return 'issues';
}

export async function getDCFeeds(): Promise<DCAgency[]> {
  const client = createClient();
  const allFeeds: MobilityDataFeed[] = [];
  
  let offset = 0;
  const limit = 100;
  let hasMore = true;

  while (hasMore) {
    const response = await client.getFeeds({
      limit,
      offset,
      countryCode: 'US',
      status: 'active'
    });
    
    allFeeds.push(...response.feeds);
    offset += limit;
    hasMore = response.feeds.length === limit;
  }

  const dcBoundingBox = {
    minLat: 38.7,
    maxLat: 39.3,
    minLon: -77.6,
    maxLon: -76.8
  };

  const dcFeeds = allFeeds.filter(feed => {
    if (!feed.locations || feed.locations.length === 0) {
      return DC_AGENCIES.some(agency => 
        agency.providers.some(p => feed.provider.includes(p))
      );
    }
    
    return feed.locations.some(loc => 
      loc.country_code === 'US' && (
        loc.subdivision_name === 'District of Columbia' ||
        loc.subdivision_name === 'Virginia' ||
        loc.subdivision_name === 'Maryland'
      )
    );
  });

  const agencies: DCAgency[] = DC_AGENCIES.map(agencyDef => {
    const agencyFeeds = dcFeeds
      .filter(feed => 
        agencyDef.providers.some(p => feed.provider.includes(p))
      )
      .map(processFeed);

    return {
      id: agencyDef.id,
      name: agencyDef.name,
      slug: agencyDef.slug,
      website: agencyDef.website,
      feeds: agencyFeeds,
      overallStatus: determineAgencyStatus(agencyFeeds)
    };
  }).filter(agency => agency.feeds.length > 0);

  return agencies;
}