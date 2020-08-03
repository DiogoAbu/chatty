import { useCallback, useState } from 'react';

import useMethod from './use-method';

/**
 * Return state as value and memoized setter for state
 */
export default function useInput(
  initialValue: string,
  afterChangeText: (text: string) => void = () => null,
): {
  value: string;
  onChangeText: (text: string) => void;
} {
  const [value, setValue] = useState(initialValue);

  const afterValueMemo = useMethod(afterChangeText);

  const onChangeText = useCallback(
    (text: string) => {
      setValue(text);
      afterValueMemo(text);
    },
    [afterValueMemo],
  );

  return {
    value,
    onChangeText,
  };
}
