import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
    padding: 16,
  },

  title: {
    marginLeft: 12,
  },

  description: {
    textAlign: 'center',
    marginBottom: 24,
  },

  formContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
  },

  passInput: {
    marginTop: 6,
  },

  button: {
    paddingVertical: 6,
  },

  buttonOutlined: {
    marginTop: 12,
    alignSelf: 'center',
  },
});

export default styles;
