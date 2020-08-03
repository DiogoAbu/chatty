import { DependencyList, useEffect } from 'react';

import { autorun, IAutorunOptions } from 'mobx';

export default function useAutorun(
  view: (r: any) => any,
  deps: DependencyList,
  opts?: IAutorunOptions | undefined,
): void {
  useEffect(() => {
    return autorun(view, opts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
