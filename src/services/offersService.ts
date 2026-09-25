import { Offer, OfferFilterParams, DashboardMetrics } from '../types/offer';
import { MonitoredSearch, CreateSearchInput, SearchStatus } from '../types/search';
import { supabase } from '../lib/supabase';

const FAVORITES_STORAGE_KEY = 'offerminer_favorites_v1';
async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const headers: Record<string, string> = {
    'content-type': 'application/json',
    ...(init?.headers as Record<string, string>),
  };

  if (token) {
    headers['authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`/api${path}`, {
    ...init,
    headers,
  });
  
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    if (response.status === 401) {
      await supabase.auth.signOut();
      throw new Error('Sessão expirada. Faça login novamente.');
    }
    throw new Error(data.message || `Erro na API (${response.status})`);
  }
  return response.json();
}


// Helper to get local favorites
function getLocalFavorites(): string[] {
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Helper to save local favorites
function saveLocalFavorites(favs: string[]) {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favs));
  } catch (e) {
    console.error('Falha ao salvar favoritos no localStorage', e);
  }
}

// Attach local favorite state to an offer
function hydrateOffer(offer: Offer, favIds: string[]): Offer {
  return {
    ...offer,
    isFavorite: favIds.includes(offer.id),
  };
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Consulta catálogo de ofertas aplicando busca, filtros múltiplos e ordenação.
 */
export async function getOffers(params: OfferFilterParams = {}): Promise<{
  offers: Offer[];
  total: number;
  availableNiches: string[];
  availableCountries: string[];
  availableTechnologies: string[];
}> {
  const catalog = await api<Offer[]>('/offers');
  const favIds = getLocalFavorites();
  let results = catalog.map((o) => hydrateOffer(o, favIds));

  // Extract distinct metadata before filtering
  const availableNiches = Array.from(new Set(catalog.map((o) => o.niche))).sort();
  const availableCountries = Array.from(new Set(catalog.map((o) => o.country))).sort();
  const availableTechnologies = Array.from(new Set(catalog.map((o) => o.pageTechnology))).sort();

  // Search keyword across name, advertiser, keywords, niche, domain, ad copy
  if (params.search && params.search.trim()) {
    const term = params.search.toLowerCase().trim();
    results = results.filter((offer) => {
      const matchName = offer.name.toLowerCase().includes(term);
      const matchNiche = offer.niche.toLowerCase().includes(term);
      const matchDomain = offer.salesPageDomain.toLowerCase().includes(term);
      const matchSummary = offer.summary.toLowerCase().includes(term);
      const matchKeywords = offer.keywords.some((k) => k.toLowerCase().includes(term));
      const matchAdvertiser = offer.advertiserPages.some((p) => p.name.toLowerCase().includes(term));
      const matchAds = offer.ads.some((ad) => 
        ad.body.toLowerCase().includes(term) || (ad.title && ad.title.toLowerCase().includes(term))
      );
      return matchName || matchNiche || matchDomain || matchSummary || matchKeywords || matchAdvertiser || matchAds;
    });
  }

  // Filter: Nicho
  if (params.niche && params.niche !== 'all') {
    results = results.filter((o) => o.niche.toLowerCase() === params.niche?.toLowerCase());
  }

  // Filter: País
  if (params.country && params.country !== 'all') {
    results = results.filter((o) => o.country.toLowerCase() === params.country?.toLowerCase());
  }

  // Filter: Idioma
  if (params.language && params.language !== 'all') {
    results = results.filter((o) => o.language.toLowerCase() === params.language?.toLowerCase());
  }

  // Filter: Formato do criativo
  if (params.creativeFormat) {
    results = results.filter((o) => o.creativeFormats.includes(params.creativeFormat!));
  }

  // Filter: Tipo de funil
  if (params.funnelType) {
    results = results.filter((o) => o.funnelType === params.funnelType);
  }

  // Filter: VSL
  if (params.hasVsl && params.hasVsl !== 'all') {
    const needVsl = params.hasVsl === 'yes';
    results = results.filter((o) => o.hasVsl === needVsl);
  }

  // Filter: Status
  if (params.status && params.status !== 'all') {
    results = results.filter((o) => o.status === params.status);
  }

  // Filter: Ticket min/max
  if (params.minTicket !== undefined && !isNaN(params.minTicket)) {
    results = results.filter((o) => o.ticket !== null && o.ticket >= params.minTicket!);
  }
  if (params.maxTicket !== undefined && !isNaN(params.maxTicket)) {
    results = results.filter((o) => o.ticket !== null && o.ticket <= params.maxTicket!);
  }

  // Filter: Idade mínima em dias
  if (params.minAgeDays !== undefined && !isNaN(params.minAgeDays)) {
    results = results.filter((o) => o.oldestActiveAdDays >= params.minAgeDays!);
  }

  // Filter: Mínimo de anúncios
  if (params.minAdsCount !== undefined && !isNaN(params.minAdsCount)) {
    results = results.filter((o) => o.activeAdsCount >= params.minAdsCount!);
  }

  // Filter: Mínimo de criativos
  if (params.minCreativesCount !== undefined && !isNaN(params.minCreativesCount)) {
    results = results.filter((o) => o.uniqueCreativesCount >= params.minCreativesCount!);
  }

  // Filter: Plataforma
  if (params.platform) {
    results = results.filter((o) => o.platforms.includes(params.platform!));
  }

  // Filter: Tecnologia da página
  if (params.pageTechnology && params.pageTechnology !== 'all') {
    results = results.filter((o) => o.pageTechnology.toLowerCase() === params.pageTechnology?.toLowerCase());
  }

  // Filter: Apenas favoritos
  if (params.onlyFavorites) {
    results = results.filter((o) => o.isFavorite);
  }

  // Sorting
  const sortBy = params.sortBy || 'scale_score_desc';
  results.sort((a, b) => {
    switch (sortBy) {
      case 'scale_score_desc':
        return b.scaleScore - a.scaleScore;
      case 'ads_desc':
        return b.activeAdsCount - a.activeAdsCount;
      case 'creatives_desc':
        return b.uniqueCreativesCount - a.uniqueCreativesCount;
      case 'oldest_desc':
        return b.oldestActiveAdDays - a.oldestActiveAdDays;
      case 'newest_desc':
        return a.oldestActiveAdDays - b.oldestActiveAdDays;
      case 'ticket_asc':
        return (a.ticket ?? 9999) - (b.ticket ?? 9999);
      case 'ticket_desc':
        return (b.ticket ?? 0) - (a.ticket ?? 0);
      default:
        return b.scaleScore - a.scaleScore;
    }
  });

  return {
    offers: results,
    total: results.length,
    availableNiches,
    availableCountries,
    availableTechnologies,
  };
}

/**
 * Retorna uma oferta individual por ID ou Slug com todos os anúncios e criativos.
 */
export async function getOfferById(idOrSlug: string): Promise<Offer | null> {
  const favIds = getLocalFavorites();
  try { return hydrateOffer(await api<Offer>(`/offers/${encodeURIComponent(idOrSlug)}`), favIds); }
  catch { return null; }
}

/**
 * Alterna status de favorito de uma oferta e persiste em localStorage.
 */
export async function toggleFavorite(offerId: string): Promise<{ isFavorite: boolean }> {
  await sleep(60);
  const favs = getLocalFavorites();
  const exists = favs.includes(offerId);
  let updated: string[];

  if (exists) {
    updated = favs.filter((id) => id !== offerId);
  } else {
    updated = [...favs, offerId];
  }

  saveLocalFavorites(updated);
  return { isFavorite: !exists };
}

/**
 * Retorna métricas globais para a página de Dashboard.
 */
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const catalog = await api<Offer[]>('/offers');
  const favIds = getLocalFavorites();
  const hydrated = catalog.map((o) => hydrateOffer(o, favIds));

  const monitoredOffersCount = hydrated.length;
  const activeAdsCount = hydrated.reduce((acc, curr) => acc + curr.activeAdsCount, 0);
  const uniqueCreativesCount = hydrated.reduce((acc, curr) => acc + curr.uniqueCreativesCount, 0);
  const scalingOffersCount = hydrated.filter((o) => o.status === 'scaling').length;

  // Fastest growing (by 7-day ads change)
  const fastestGrowingOffers = [...hydrated]
    .sort((a, b) => b.adsChangeLast7Days - a.adsChangeLast7Days)
    .slice(0, 5);

  // Recently added (by oldestActiveAdDays ascending)
  const recentOffers = [...hydrated]
    .sort((a, b) => a.oldestActiveAdDays - b.oldestActiveAdDays)
    .slice(0, 5);

  // 30-day discovery trend (simulated aggregate data points)
  const byDate = new Map<string, { offersCount: number; adsCount: number }>();
  hydrated.forEach((offer) => offer.history.forEach((point) => {
    const key = point.date.slice(0, 10);
    const value = byDate.get(key) || { offersCount: 0, adsCount: 0 };
    value.offersCount += 1; value.adsCount += point.activeAds; byDate.set(key, value);
  }));
  const dailyDiscoveryData = [...byDate.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-30)
    .map(([date, value]) => ({ date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), ...value }));

  // Niche breakdown
  const nicheMap: Record<string, number> = {};
  hydrated.forEach((o) => {
    nicheMap[o.niche] = (nicheMap[o.niche] || 0) + 1;
  });

  const nicheDistribution = Object.entries(nicheMap)
    .map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / hydrated.length) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  return {
    monitoredOffersCount,
    activeAdsCount,
    uniqueCreativesCount,
    scalingOffersCount,
    lastUpdatedAt: hydrated.length ? new Date(Math.max(...hydrated.map(o => new Date(o.lastCheckedAt).getTime()))).toLocaleString('pt-BR') : 'Nenhuma coleta executada',
    recentOffers,
    fastestGrowingOffers,
    dailyDiscoveryData,
    nicheDistribution,
  };
}

/**
 * Retorna as pesquisas monitoradas.
 */
export async function getMonitoredSearches(): Promise<MonitoredSearch[]> {
  return api<MonitoredSearch[]>('/searches');
}

/**
 * Cria uma nova pesquisa monitorada e salva no estado local.
 */
export async function createMonitoredSearch(input: CreateSearchInput): Promise<MonitoredSearch> {
  return api<MonitoredSearch>('/searches', { method: 'POST', body: JSON.stringify(input) });
}

/**
 * Alterna status de uma pesquisa monitorada (ativo / pausado).
 */
export async function toggleSearchStatus(id: string): Promise<MonitoredSearch | null> {
  return api<MonitoredSearch>(`/searches/${id}/status`, { method: 'PATCH' });
}

export async function runMonitoredSearch(id: string): Promise<{ search: MonitoredSearch; rawAdsCount: number; offersCount: number }> {
  return api(`/searches/${id}/run`, { method: 'POST' });
}
