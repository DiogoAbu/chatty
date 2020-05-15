import { StyleSheet } from 'react-native';

import { Colors } from 'react-native-paper';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },

  fullCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonPermission: {
    marginTop: 20,
  },

  gestureHandlerView: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },

  camera: {
    position: 'absolute',
    top: 0,
    left: 0,
  },

  elapsedTimeContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  elapsedTime: {
    fontSize: 20,
  },

  microphoneIcon: {
    color: Colors.red500,
    fontSize: 20,
    marginLeft: 8,
  },

  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 8,
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    overflow: 'visible',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },

  shutterIcon: {
    overflow: 'visible',
  },

  pictureListContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    position: 'absolute',
    bottom: 90,
    right: 6,
  },
  pictureListContent: {
    padding: 6,
  },
  iconPictureSelected: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
});

export default styles;
