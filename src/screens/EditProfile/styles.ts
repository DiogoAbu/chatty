import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    margin: 16,
  },

  contentContainer: {
    flexGrow: 1,
  },

  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
  },

  avatarContainer: {
    position: 'relative',
    alignSelf: 'center',
  },
  avatar: {
    alignSelf: 'center',
  },
  avatarHelper: {
    textAlign: 'center',
  },
  fabDiscardPicture: {
    position: 'absolute',
    bottom: 0,
  },

  button: {
    marginTop: 16,
    paddingVertical: 8,
  },
});

export default styles;
