import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
  },

  touchable: {
    flex: 1,
  },

  formContent: {
    margin: 0,
    padding: 16,
    elevation: 8,
    borderBottomStartRadius: 0,
    borderBottomEndRadius: 0,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
  },
  inputBottom: {
    marginTop: 4,
  },
  button: {
    marginTop: 8,
    paddingVertical: 8,
  },
});

export default styles;
