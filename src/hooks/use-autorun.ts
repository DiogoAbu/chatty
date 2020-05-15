import { DependencyList, useEffect } from 'react';

import { autorun } from 'mobx';

export default function useAutorun(view: (r: any) => any, deps: DependencyList, opts?: any) {
  useEffect(() => {
    return autorun(view, opts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
