export interface MobilityDataFeed {
  id: string;
  data_type: 'gtfs' | 'gtfs_rt';
  status: 'active' | 'deprecated' | 'inactive' | 'development' | 'future';
  provider: string;
  feed_name?: string;
  note?: string;
  feed_contact_email?: string;
  source_info?: {
    producer_url?: string;
    authentication_type?: 0 | 1 | 2 | null ;
    authentication_info_url?: string;
    api_key_parameter_name?: string;
    license_url?: string;
    license_id?: string;
    license_is_spdx?: string;
    license_notes?: string;
  };
  redirects?: Array<{
    target_id: string;
  }>;
  locations?: Array<{
    country_code: string;
    country: string;
    subdivision_name?: string;
    municipality?: string;
  }>;
  latest?: {
    downloaded_at: string;
    hash: string;
    url: string;
    hosted_url: string;
  };
  gtfs_rt?: {
    entity_type: string[];
    url: string;
    authentication_type?: number;
    authentication_info_url?: string;
  };
}

export interface ValidationResult {
  summary: {
    errors: number;
    warnings: number;
    infos: number;
  };
  lastValidated?: string;
}

export interface DCAgency {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  website?: string;
  feeds: ProcessedFeed[];
  overallStatus: 'healthy' | 'issues' | 'error' | 'unknown';
}

export interface ProcessedFeed {
  id: string;
  type: 'gtfs' | 'gtfs_rt';
  name: string;
  status: string;
  downloadUrls: {
    mobilityData?: string;
    direct?: string;
  };
  lastUpdated?: string;
  validation?: ValidationResult;
  realtimeTypes?: string[];
}

export interface MobilityDataResponse {
  feeds: MobilityDataFeed[];
  total: number;
  limit: number;
  offset: number;
}