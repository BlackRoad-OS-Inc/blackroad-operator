'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchMinerEvents, FetchMinerEventsOptions } from './miners-api';

export function useMinerEvents(options?: FetchMinerEventsOptions) {
  return useQuery({
    queryKey: ['miner-events', options?.minerId ?? 'xmrig'],
    queryFn: ({ signal }) => fetchMinerEvents({ ...options, signal }),
    refetchInterval: 15_000,
    staleTime: 10_000,
  });
}
