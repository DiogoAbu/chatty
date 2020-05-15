import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    padding: 16,
  },
  formContent: {
    margin: 0,
    marginTop: -40,
    padding: 12,
    elevation: 2,
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
