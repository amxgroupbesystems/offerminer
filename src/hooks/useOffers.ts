import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getOffers,
  getOfferById,
  getDashboardMetrics,
  getMonitoredSearches,
  createMonitoredSearch,
  toggleSearchStatus,
  runMonitoredSearch,
} from '../services/offersService';
import { OfferFilterParams } from '../types/offer';
import { CreateSearchInput } from '../types/search';

export function useOffers(params: OfferFilterParams) {
  return useQuery({
    queryKey: ['offers', params],
    queryFn: () => getOffers(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useOfferDetails(idOrSlug: string | undefined) {
  return useQuery({
    queryKey: ['offer', idOrSlug],
    queryFn: () => (idOrSlug ? getOfferById(idOrSlug) : null),
    enabled: Boolean(idOrSlug),
    staleTime: 1000 * 60 * 5,
  });
}

export function useDashboardMetricsQuery() {
  return useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: () => getDashboardMetrics(),
    staleTime: 1000 * 60 * 2,
  });
}

export function useMonitoredSearchesQuery() {
  return useQuery({
    queryKey: ['monitored-searches'],
    queryFn: () => getMonitoredSearches(),
    staleTime: 1000 * 60 * 1,
  });
}

export function useCreateMonitoredSearchMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSearchInput) => createMonitoredSearch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitored-searches'] });
    },
  });
}

export function useToggleSearchStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => toggleSearchStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitored-searches'] });
    },
  });
}

export function useRunMonitoredSearchMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => runMonitoredSearch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitored-searches'] });
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
  });
}
