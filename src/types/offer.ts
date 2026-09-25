export type OfferStatus = 'scaling' | 'monitored' | 'recent' | 'inactive';

export type FunnelType = 
  | 'sales_page' 
  | 'quiz' 
  | 'whatsapp' 
  | 'app' 
  | 'direct_checkout';

export type CreativeFormat = 'image' | 'video' | 'carousel' | 'dynamic';

export type Platform = 'facebook' | 'instagram' | 'messenger' | 'audience_network' | 'threads';

export interface AdvertiserPage {
  id: string;
  name: string;
  avatarUrl?: string;
  verified?: boolean;
  category?: string;
  adsCount?: number;
}

export interface Creative {
  id: string;
  type: CreativeFormat;
  thumbnailUrl: string;
  mediaUrl?: string;
  title?: string;
  body?: string;
  adsUsingCount: number;
  firstSeenAt: string;
  duration?: string;
  aspectRatio?: '1:1' | '9:16' | '16:9' | '4:5';
  carouselCardsCount?: number;
}

export interface Ad {
  id: string;
  libraryId: string;
  libraryUrl: string;
  advertiserPageId: string;
  advertiserPageName: string;
  body: string;
  title: string | null;
  callToAction: string | null;
  startDate: string;
  isActive: boolean;
  platforms: Platform[];
  creativeId: string;
  destinationUrl: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  type: 'first_seen' | 'new_ads' | 'new_creatives' | 'ticket_change' | 'ad_stopped' | 'last_check';
  title: string;
  description: string;
}

export interface HistoryPoint {
  date: string;
  activeAds: number;
  uniqueCreatives: number;
  ticket?: number | null;
  scaleScore?: number;
}

export interface Offer {
  id: string;
  slug: string;
  name: string;
  summary: string;
  niche: string;
  country: string;
  language: string;
  status: OfferStatus;
  funnelType: FunnelType;
  creativeFormats: CreativeFormat[];
  hasVsl: boolean;
  ticket: number | null;
  currency: 'BRL' | 'USD' | 'EUR';
  activeAdsCount: number;
  uniqueCreativesCount: number;
  oldestActiveAdDays: number;
  adsChangeLast7Days: number;
  scaleScore: number;
  salesPageUrl: string;
  salesPageDomain: string;
  pageTechnology: string;
  advertiserPages: AdvertiserPage[];
  mainCreative: Creative;
  creatives: Creative[];
  ads: Ad[];
  keywords: string[];
  platforms: Platform[];
  firstSeenAt: string;
  lastCheckedAt: string;
  timeline: TimelineEvent[];
  history: HistoryPoint[];
  isFavorite: boolean;
  keyPromises?: string[];
  scaleEvidences?: string[];
  metaLibrarySearchUrl?: string;
}

export type OfferSortOption = 
  | 'scale_score_desc'
  | 'ads_desc'
  | 'creatives_desc'
  | 'oldest_desc'
  | 'newest_desc'
  | 'ticket_asc'
  | 'ticket_desc';

export interface OfferFilterParams {
  search?: string;
  niche?: string;
  country?: string;
  language?: string;
  creativeFormat?: CreativeFormat;
  funnelType?: FunnelType;
  hasVsl?: 'yes' | 'no' | 'all';
  status?: OfferStatus | 'all';
  minTicket?: number;
  maxTicket?: number;
  minAgeDays?: number;
  minAdsCount?: number;
  minCreativesCount?: number;
  platform?: Platform;
  pageTechnology?: string;
  sortBy?: OfferSortOption;
  onlyFavorites?: boolean;
}

export interface DashboardMetrics {
  monitoredOffersCount: number;
  activeAdsCount: number;
  uniqueCreativesCount: number;
  scalingOffersCount: number;
  lastUpdatedAt: string;
  recentOffers: Offer[];
  fastestGrowingOffers: Offer[];
  dailyDiscoveryData: { date: string; offersCount: number; adsCount: number }[];
  nicheDistribution: { name: string; count: number; percentage: number }[];
}
