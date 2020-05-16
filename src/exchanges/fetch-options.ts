import { Exchange, Operation } from 'urql';
import { fromPromise, fromValue, map, mergeMap, pipe } from 'wonka';

export const fetchOptionsExchange = (fn: any): Exchange => ({ forward }) => (ops$) => {
  return pipe(
    ops$,
    mergeMap((operation: Operation) => {
      const result = fn(operation.context.fetchOptions);
      return pipe(
        typeof result.then === 'function' ? fromPromise<any>(result) : fromValue<any>(result),
        map((fetchOptions: RequestInit | (() => RequestInit)) => ({
          ...operation,
          context: { ...operation.context, fetchOptions },
        })),
      );
    }),
    forward,
  );
};