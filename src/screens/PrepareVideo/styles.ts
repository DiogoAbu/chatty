import { I18nManager, StyleSheet } from 'react-native';

import { Colors } from 'react-native-paper';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },

  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    padding: 9,
    paddingHorizontal: 12,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
});

export default styles;
