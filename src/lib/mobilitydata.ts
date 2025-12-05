import type {
  MobilityDataFeed,
  GtfsFeed,
  GtfsRTFeed,
  GtfsDataset,
  LicenseBase,
  LicenseWithRules
} from './types';

const MOBILITY_API_BASE = 'https://api.mobilitydatabase.org/v1';

interface MobilityDataConfig {
  apiKey: string;
}

export class MobilityDataClient {
  private apiKey: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(config: MobilityDataConfig) {
    this.apiKey = config.apiKey;
  }

  private async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken; // TypeScript knows this is non-null here
    }

    const response = await fetch(`${MOBILITY_API_BASE}/tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh_token: this.apiKey,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get access token: ${response.statusText}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    // Tokens are valid for 1 hour, set expiry to 55 minutes to be safe
    this.tokenExpiry = Date.now() + (55 * 60 * 1000);
    return this.accessToken!; // We just set it, so it's non-null
  }

  private async request<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const token = await this.getAccessToken();
    const url = new URL(`${MOBILITY_API_BASE}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value);
        }
      });
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getFeeds(params: {
    limit?: number;
    offset?: number;
    status?: string;
    provider?: string;
    producer_url?: string;
    country_code?: string;
    subdivision_name?: string;
    municipality?: string;
    is_official?: boolean;
  } = {}): Promise<MobilityDataFeed[]> {
    const queryParams: Record<string, string> = {};
    
    if (params.limit) queryParams.limit = params.limit.toString();
    if (params.offset) queryParams.offset = params.offset.toString();
    if (params.status) queryParams.status = params.status;
    if (params.provider) queryParams.provider = params.provider;
    if (params.producer_url) queryParams.producer_url = params.producer_url;
    if (params.country_code) queryParams.country_code = params.country_code;
    if (params.subdivision_name) queryParams.subdivision_name = params.subdivision_name;
    if (params.municipality) queryParams.municipality = params.municipality;
    if (params.is_official !== undefined) queryParams.is_official = params.is_official.toString();

    const result = await this.request<MobilityDataFeed[]>('/feeds', queryParams);
    return result;
  }

  async getFeedById(feedId: string): Promise<MobilityDataFeed> {
    return this.request<MobilityDataFeed>(`/feeds/${feedId}`);
  }

  async getGtfsFeeds(params: {
    limit?: number;
    offset?: number;
    provider?: string;
    producer_url?: string;
    country_code?: string;
    subdivision_name?: string;
    municipality?: string;
    dataset_latitudes?: string;
    dataset_longitudes?: string;
    bounding_filter_method?: 'completely_enclosed' | 'partially_enclosed' | 'disjoint';
    is_official?: boolean;
  } = {}): Promise<GtfsFeed[]> {
    const queryParams: Record<string, string> = {};
    
    if (params.limit) queryParams.limit = params.limit.toString();
    if (params.offset) queryParams.offset = params.offset.toString();
    if (params.provider) queryParams.provider = params.provider;
    if (params.producer_url) queryParams.producer_url = params.producer_url;
    if (params.country_code) queryParams.country_code = params.country_code;
    if (params.subdivision_name) queryParams.subdivision_name = params.subdivision_name;
    if (params.municipality) queryParams.municipality = params.municipality;
    if (params.dataset_latitudes) queryParams.dataset_latitudes = params.dataset_latitudes;
    if (params.dataset_longitudes) queryParams.dataset_longitudes = params.dataset_longitudes;
    if (params.bounding_filter_method) queryParams.bounding_filter_method = params.bounding_filter_method;
    if (params.is_official !== undefined) queryParams.is_official = params.is_official.toString();

    const result = await this.request<GtfsFeed[]>('/gtfs_feeds', queryParams);
    return result;
  }

  async getGtfsFeedById(feedId: string): Promise<GtfsFeed> {
    return this.request<GtfsFeed>(`/gtfs_feeds/${feedId}`);
  }

  async getGtfsRtFeeds(params: {
    limit?: number;
    offset?: number;
    provider?: string;
    producer_url?: string;
    entity_types?: string;
    country_code?: string;
    subdivision_name?: string;
    municipality?: string;
    is_official?: boolean;
  } = {}): Promise<GtfsRTFeed[]> {
    const queryParams: Record<string, string> = {};
    
    if (params.limit) queryParams.limit = params.limit.toString();
    if (params.offset) queryParams.offset = params.offset.toString();
    if (params.provider) queryParams.provider = params.provider;
    if (params.producer_url) queryParams.producer_url = params.producer_url;
    if (params.entity_types) queryParams.entity_types = params.entity_types;
    if (params.country_code) queryParams.country_code = params.country_code;
    if (params.subdivision_name) queryParams.subdivision_name = params.subdivision_name;
    if (params.municipality) queryParams.municipality = params.municipality;
    if (params.is_official !== undefined) queryParams.is_official = params.is_official.toString();

    const result = await this.request<GtfsRTFeed[]>('/gtfs_rt_feeds', queryParams);
    return result;
  }

  async getGtfsRtFeedById(feedId: string): Promise<GtfsRTFeed> {
    return this.request<GtfsRTFeed>(`/gtfs_rt_feeds/${feedId}`);
  }

  async getGtfsFeedDatasets(feedId: string, params: {
    latest?: boolean;
    limit?: number;
    offset?: number;
    downloaded_after?: string;
    downloaded_before?: string;
  } = {}): Promise<GtfsDataset[]> {
    const queryParams: Record<string, string> = {};
    
    if (params.latest !== undefined) queryParams.latest = params.latest.toString();
    if (params.limit) queryParams.limit = params.limit.toString();
    if (params.offset) queryParams.offset = params.offset.toString();
    if (params.downloaded_after) queryParams.downloaded_after = params.downloaded_after;
    if (params.downloaded_before) queryParams.downloaded_before = params.downloaded_before;

    const result = await this.request<GtfsDataset[]>(`/gtfs_feeds/${feedId}/datasets`, queryParams);
    return result;
  }

  async getGtfsDatasetById(datasetId: string): Promise<GtfsDataset> {
    return this.request<GtfsDataset>(`/datasets/gtfs/${datasetId}`);
  }

  async getGtfsFeedGtfsRtFeeds(feedId: string): Promise<GtfsRTFeed[]> {
    return this.request<GtfsRTFeed[]>(`/gtfs_feeds/${feedId}/gtfs_rt_feeds`);
  }

  async searchFeeds(params: {
    search_query?: string;
    limit?: number;
    offset?: number;
    status?: string[];
    feed_id?: string;
    data_type?: string;
    is_official?: boolean;
    version?: string;
    feature?: string[];
  } = {}): Promise<{total: number; results: MobilityDataFeed[]}> {
    const queryParams: Record<string, string> = {};
    
    if (params.search_query) queryParams.search_query = params.search_query;
    if (params.limit) queryParams.limit = params.limit.toString();
    if (params.offset) queryParams.offset = params.offset.toString();
    if (params.status) queryParams.status = params.status.join(',');
    if (params.feed_id) queryParams.feed_id = params.feed_id;
    if (params.data_type) queryParams.data_type = params.data_type;
    if (params.is_official !== undefined) queryParams.is_official = params.is_official.toString();
    if (params.version) queryParams.version = params.version;
    if (params.feature) queryParams.feature = params.feature.join(',');

    return this.request<{total: number; results: MobilityDataFeed[]}>('/search', queryParams);
  }

  async getLicenses(params: {
    limit?: number;
    offset?: number;
  } = {}): Promise<LicenseBase[]> {
    const queryParams: Record<string, string> = {};
    
    if (params.limit) queryParams.limit = params.limit.toString();
    if (params.offset) queryParams.offset = params.offset.toString();

    const result = await this.request<LicenseBase[]>('/licenses', queryParams);
    return result;
  }

  async getLicenseById(licenseId: string): Promise<LicenseWithRules> {
    return this.request<LicenseWithRules>(`/licenses/${licenseId}`);
  }

  async getMetadata(): Promise<{version: string; commit_hash: string}> {
    return this.request<{version: string; commit_hash: string}>('/metadata');
  }
}

export function createClient(): MobilityDataClient {
  const apiKey = import.meta.env.MOBILITY_API_KEY;
  
  if (!apiKey) {
    throw new Error('MOBILITY_API_KEY environment variable is required');
  }

  return new MobilityDataClient({ apiKey });
}
