import { Exchange, Operation } from 'urql';
import { fromPromise, fromValue, map, mergeMap, pipe } from 'wonka';

export const fetchOptionsExchange = (fn: (fetchOptions: RequestInit) => Promise<RequestInit>): Exchange => ({
  forward,
}) => (ops$) => {
  return pipe(
    ops$,
    mergeMap((operation: Operation) => {
      const result = fn(operation.context.fetchOptions as RequestInit);
      return pipe(
        typeof result.then === 'function' ? fromPromise(result) : fromValue<any>(result),
        map((fetchOptions: RequestInit) => ({
          ...operation,
          context: { ...operation.context, fetchOptions },
        })),
      );
    }),
    forward,
  );
};
