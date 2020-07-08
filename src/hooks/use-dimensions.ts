import { useEffect, useState } from 'react';
import { Dimensions, ScaledSize } from 'react-native';

type DimensionsResult = {
  window: ScaledSize;
  screen: ScaledSize;
};

// https://www.reactnativeschool.com/building-a-dimensions-hook-in-react-native
export default function useDimensions(type: 'window' | 'screen'): [number, number, boolean, number, number] {
  const [dimensions, setDimensions] = useState(Dimensions.get(type));

  useEffect(() => {
    const onChange = (result: DimensionsResult) => {
      setDimensions(result[type]);
    };

    Dimensions.addEventListener('change', onChange);
    return () => Dimensions.removeEventListener('change', onChange);
  });

  return [
    dimensions.width,
    dimensions.height,
    dimensions.width > dimensions.height,
    dimensions.scale,
    dimensions.fontScale,
  ];
}
