import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { Theme, withTheme } from 'react-native-paper';
// @ts-ignore
import Icon from 'react-native-paper/lib/module/components/Icon';
import Animated, { Easing, timing, Value } from 'react-native-reanimated';

type Props = {
  source: string;
  color: string;
  size: number;
  theme: Theme;
  visible: boolean;
  style?: StyleProp<ViewStyle>;
};

type State = {
  currentVisible: boolean;
  fade: Value<number>;
};

class FadeIcon extends React.Component<Props, State> {
  static getDerivedStateFromProps(nextProps: Props, nextState: State) {
    if (nextState.currentVisible === nextProps.visible) {
      return null;
    }

    return {
      currentVisible: nextProps.visible,
      previousVisible: nextState.currentVisible,
    };
  }

  constructor(props: Props) {
    super(props);
    this.state = {
      currentVisible: props.visible,
      fade: new Value(0),
    };
  }

  componentDidMount() {
    this.animate();
  }

  shouldComponentUpdate(prev: Readonly<Props>) {
    const { props } = this;
    if (prev.visible !== props.visible) {
      return true;
    }
    return false;
  }

  componentDidUpdate() {
    this.animate();
  }

  animate() {
    const { currentVisible, fade } = this.state;
    const {
      theme: {
        animation: { scale },
      },
    } = this.props;

    timing(fade, {
      toValue: currentVisible ? 1 : 0,
      duration: scale * 200,
      easing: Easing.linear,
    }).start();
  }

  render() {
    const { source, color, size, style } = this.props;
    const { fade } = this.state;

    const scale = fade.interpolate({
      inputRange: [0, 1],
      outputRange: [0.7, 1],
    });

    return (
      <View
        style={[
          styles.content,
          {
            height: size,
            width: size,
          },
          style,
        ]}
      >
        <Animated.View style={[styles.icon, { opacity: fade, transform: [{ scale }] }]}>
          <Icon color={color} size={size} source={source} />
        </Animated.View>
      </View>
    );
  }
}

export default withTheme(FadeIcon);

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
