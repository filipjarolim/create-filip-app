import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { MutationCache, QueryClient } from '@tanstack/react-query';

import { enqueueFailedMutation, isOfflineError } from '@/lib/offline-queue';

const DAY = 1000 * 60 * 60 * 24;

export const QUERY_CACHE_KEY = 'create-filip-app-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: DAY,
      staleTime: 60_000,
      retry: 2,
    },
    mutations: {
      retry: 1,
    },
  },
  mutationCache: new MutationCache({
    onError: (error, variables, _context, mutation) => {
      const name = mutation.options.mutationKey?.[0];
      if (typeof name === 'string' && isOfflineError(error)) {
        void enqueueFailedMutation(name, variables);
      }
    },
  }),
});

export const queryPersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: QUERY_CACHE_KEY,
});
