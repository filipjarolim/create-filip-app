import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';

import { queryClient, queryPersister } from '@/lib/query-client';

const DAY = 1000 * 60 * 60 * 24;

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister: queryPersister, maxAge: DAY }}>
      {children}
    </PersistQueryClientProvider>
  );
}
