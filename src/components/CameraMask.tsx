import React, { FC } from 'react';
import { StyleSheet, View } from 'react-native';

import Svg, { Circle, Defs, Mask, Rect } from 'react-native-svg';

import { PICTURE_CIRCUMFERENCE } from '!/config';
import useDimensions from '!/hooks/use-dimensions';

const CameraMask: FC<unknown> = () => {
  const [width, height] = useDimensions('window');

  const circleRadius = width / PICTURE_CIRCUMFERENCE;
  const viewBox = `0 0 ${width} ${height}`;

  return (
    <View style={styles.container}>
      <Svg height={height} viewBox={viewBox}>
        <Defs>
          <Mask id='mask'>
            <Rect fill='#fff' fillOpacity={0.7} height={height} width={width} />
            <Circle cx={width / 2} cy={height / 2} fill='#000' r={circleRadius} />
          </Mask>
        </Defs>

        <Rect fill='#000' height={height} mask='url(#mask)' width={width} />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default CameraMask;
