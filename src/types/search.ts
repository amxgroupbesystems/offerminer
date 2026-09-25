export type SearchStatus = 'active' | 'paused' | 'running' | 'completed';

export interface MonitoredSearch {
  id: string;
  name: string;
  keyword: string;
  niche?: string;
  queries?: string[];
  country: string;
  status: SearchStatus;
  adStatus: 'ACTIVE' | 'ALL';
  resultsCount: number;
  identifiedOffersCount: number;
  lastExecutedAt: string;
  nextExecutionAt: string;
  frequency: 'daily' | 'twice_daily' | 'hourly' | 'weekly';
  limitResults: number;
  matchedOfferSlugs?: string[];
  createdAt: string;
}

export interface CreateSearchInput {
  name: string;
  keyword: string;
  niche?: string;
  country: string;
  status: SearchStatus;
  limitResults: number;
  frequency: 'daily' | 'twice_daily' | 'hourly' | 'weekly';
}
