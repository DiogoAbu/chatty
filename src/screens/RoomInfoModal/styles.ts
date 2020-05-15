import { StyleSheet } from 'react-native';

import { Colors } from 'react-native-paper';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
  },

  container: {
    elevation: 4,
  },

  pictureContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    color: Colors.white,
    padding: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },

  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
});

export default styles;
