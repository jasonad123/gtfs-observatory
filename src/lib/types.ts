// API Response Types
export interface MobilityDataResponse {
  feeds?: MobilityDataFeed[];
  total?: number;
  limit?: number;
  offset?: number;
}

// Base Feed Types
export type FeedStatus = 'active' | 'deprecated' | 'inactive' | 'development' | 'future';
export type DataType = 'gtfs' | 'gtfs_rt' | 'gbfs';
export type EntityType = 'vp' | 'tu' | 'sa'; // vehicle positions, trip updates, service alerts

export interface ExternalId {
  external_id: string;
  source: string;
}

export interface Redirect {
  target_id: string;
  comment?: string;
}

export interface Location {
  country_code: string;
  country: string;
  subdivision_name?: string;
  municipality?: string;
}

export interface SourceInfo {
  producer_url?: string;
  authentication_type?: 0 | 1 | 2 | null;
  authentication_info_url?: string;
  api_key_parameter_name?: string;
  license_url?: string;
  license_id?: string;
  license_is_spdx?: boolean;
  license_notes?: string;
}

export interface BoundingBox {
  minimum_latitude: number;
  maximum_latitude: number;
  minimum_longitude: number;
  maximum_longitude: number;
}

export interface ValidationReport {
  validated_at: string;
  features?: string[];
  validator_version?: string;
  total_error: number;
  total_warning: number;
  total_info: number;
  unique_error_count: number;
  unique_warning_count: number;
  unique_info_count: number;
  url_json?: string;
  url_html?: string;
}

export interface LatestDataset {
  id: string;
  hosted_url: string;
  bounding_box?: BoundingBox;
  downloaded_at: string;
  hash: string;
  service_date_range_start?: string;
  service_date_range_end?: string;
  agency_timezone?: string;
  zipped_folder_size_mb?: number;
  unzipped_folder_size_mb?: number;
  validation_report?: ValidationReport;
}

export interface FeedRelatedLink {
  code: string;
  description?: string;
  url: string;
  created_at?: string;
}

// Base Feed Interface
export interface BaseFeed {
  id: string;
  data_type: DataType;
  created_at: string;
  external_ids?: ExternalId[];
  provider: string;
  feed_contact_email?: string;
  source_info?: SourceInfo;
  redirects?: Redirect[];
}

// Complete Feed Interface (used in /v1/feeds/{id})
export interface Feed extends BaseFeed {
  status: FeedStatus;
  official?: boolean;
  official_updated_at?: string;
  feed_name?: string;
  note?: string;
  related_links?: FeedRelatedLink[];
}

// GTFS Feed (extends Feed)
export interface GtfsFeed extends Feed {
  data_type: 'gtfs';
  locations?: Location[];
  latest_dataset?: LatestDataset;
  bounding_box?: BoundingBox;
  visualization_dataset_id?: string;
}

// GTFS Realtime Feed (extends Feed)
export interface GtfsRTFeed extends Feed {
  data_type: 'gtfs_rt';
  entity_types?: EntityType[];
  feed_references?: string[]; // MDB IDs of associated GTFS feeds
  locations?: Location[];
}

// GBFS Feed (extends BaseFeed)
export interface GbfsFeed extends BaseFeed {
  data_type: 'gbfs';
  locations?: Location[];
  system_id?: string;
  provider_url?: string;
  versions?: GbfsVersion[];
  bounding_box?: BoundingBox;
  bounding_box_generated_at?: string;
}

export interface GbfsVersion {
  version: string;
  created_at: string;
  last_updated_at: string;
  source: 'autodiscovery' | 'gbfs_versions';
  endpoints?: GbfsEndpoint[];
  latest_validation_report?: GbfsValidationReport;
}

export interface GbfsEndpoint {
  name: string;
  url: string;
  language?: string;
  is_feature: boolean;
}

export interface GbfsValidationReport {
  validated_at: string;
  total_error: number;
  report_summary_url?: string;
  validator_version?: string;
}

// Union type for any feed
export type MobilityDataFeed = GtfsFeed | GtfsRTFeed | GbfsFeed;

// Datasets
export interface GtfsDataset {
  id: string;
  feed_id: string;
  hosted_url: string;
  note?: string;
  downloaded_at: string;
  hash: string;
  bounding_box?: BoundingBox;
  validation_report?: ValidationReport;
  service_date_range_start?: string;
  service_date_range_end?: string;
  agency_timezone?: string;
  zipped_folder_size_mb?: number;
  unzipped_folder_size_mb?: number;
}

// License Types
export interface LicenseBase {
  id: string;
  type: string;
  is_spdx: boolean;
  name: string;
  url?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface LicenseRule {
  name: string;
  label: string;
  description: string;
  type: 'permission' | 'condition' | 'limitation';
}

export interface LicenseWithRules extends LicenseBase {
  license_rules: LicenseRule[];
}

// Agency-specific types
export interface TransitAgency {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  website?: string;
  color?: string; // Brand background color for the agency header (hex value)
  secondaryColor?: string; // Optional secondary brand color for angled split in header (hex value)
  textColor?: string; // Text color for the agency header (hex value)
  feedIds?: string[];
  feeds: ProcessedFeed[];
  overallStatus: 'healthy' | 'issues' | 'error' | 'unknown';
}

export interface ProcessedFeed {
  id: string;
  type: DataType;
  name: string;
  status: FeedStatus;
  downloadUrls: {
    mobilityData?: string;
    direct?: string;
  };
  lastUpdated?: string;
  validation?: ValidationReport;
  datasetId?: string; // ID of the latest dataset for GTFS feeds
  realtimeTypes?: EntityType[];
  locations?: Location[];
  boundingBox?: BoundingBox;
  authentication?: {
    type: number;
    infoUrl?: string;
    parameterName?: string;
  };
  license?: {
    id?: string;
    url?: string;
    isSpdx?: boolean;
  };
  feedReferences?: string[]; // For GTFS-RT, IDs of associated GTFS feeds
  official?: boolean;
  note?: string;
}
