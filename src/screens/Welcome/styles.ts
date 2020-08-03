import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 32,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },

  contentContainer: {
    flex: 1,
  },

  socialTitle: {
    opacity: 0.7,
    textTransform: 'uppercase',
    alignSelf: 'center',
    marginBottom: 16,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  fabButton: {
    alignSelf: 'flex-start',
  },
  button: {
    elevation: 3,
    paddingVertical: 8,
  },
});

export default styles;
