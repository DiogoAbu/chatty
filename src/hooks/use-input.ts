import { useCallback, useState } from 'react';

/**
 * Return state as value and memoized setter for state
 */
export default function useInput(initialValue: string) {
  const [value, setValue] = useState(initialValue);

  const onChangeText = useCallback((text: string) => {
    setValue(text);
  }, []);

  return {
    value,
    onChangeText,
  };
}
