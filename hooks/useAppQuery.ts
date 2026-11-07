import { useMutation, useQuery, type UseMutationOptions, type UseQueryOptions } from '@tanstack/react-query';

export function useAppQuery<T>(options: UseQueryOptions<T, Error, T, readonly unknown[]>) {
  return useQuery(options);
}

export function useAppMutation<TData, TVariables>(
  options: UseMutationOptions<TData, Error, TVariables> & { mutationKey: readonly [string, ...string[]] },
) {
  return useMutation(options);
}
