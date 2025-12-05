import type { MobilityDataFeed, MobilityDataResponse } from './types';

const MOBILITY_API_BASE = 'https://api.mobilitydatabase.org/v1';

interface MobilityDataConfig {
  apiKey: string;
}

export class MobilityDataClient {
  private apiKey: string;
  private accessToken: string | null = null;

  constructor(config: MobilityDataConfig) {
    this.apiKey = config.apiKey;
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken) {
      return this.accessToken;
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
    return this.accessToken;
  }

  async getFeeds(params: {
    limit?: number;
    offset?: number;
    status?: string;
    provider?: string;
    countryCode?: string;
    subdivisionName?: string;
    dataType?: 'gtfs' | 'gtfs_rt';
  } = {}): Promise<MobilityDataResponse> {
    const token = await this.getAccessToken();
    const searchParams = new URLSearchParams();

    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.offset) searchParams.append('offset', params.offset.toString());
    if (params.status) searchParams.append('status', params.status);
    if (params.provider) searchParams.append('provider', params.provider);
    if (params.countryCode) searchParams.append('country_code', params.countryCode);
    if (params.subdivisionName) searchParams.append('subdivision_name', params.subdivisionName);
    if (params.dataType) searchParams.append('data_type', params.dataType);

    const url = `${MOBILITY_API_BASE}/feeds?${searchParams.toString()}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch feeds: ${response.statusText}`);
    }

    return response.json();
  }

  async getFeedById(feedId: string): Promise<MobilityDataFeed> {
    const token = await this.getAccessToken();
    const response = await fetch(`${MOBILITY_API_BASE}/feeds/${feedId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch feed ${feedId}: ${response.statusText}`);
    }

    return response.json();
  }
}

export function createClient(): MobilityDataClient {
  const apiKey = import.meta.env.MOBILITY_API_KEY;
  
  if (!apiKey) {
    throw new Error('MOBILITY_API_KEY environment variable is required');
  }

  return new MobilityDataClient({ apiKey });
}