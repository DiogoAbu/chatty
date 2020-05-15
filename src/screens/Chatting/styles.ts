import { I18nManager, StyleSheet } from 'react-native';

import { Colors } from 'react-native-paper';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  contentContainerStyle: {
    flexGrow: 1,
  },

  sectionContainer: {
    alignSelf: 'center',
    paddingHorizontal: 8,
    marginVertical: 6,
    elevation: 1,
  },

  messageContainer: {
    marginHorizontal: 6,
    marginVertical: 2,
    paddingVertical: 4,
    paddingHorizontal: 6,
    elevation: 2,
  },
  messageContainerSameSender: {
    marginBottom: 4,
  },
  messageContainerLeft: {
    alignSelf: 'flex-start',
  },
  messageContainerRight: {
    alignSelf: 'flex-end',
  },

  messageContainerWithAttachment: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  attachmentContainer: {
    marginBottom: 4,
  },
  attachmentMessageContentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  attachmentMessageText: {
    flex: 1,
  },
  attachmentListContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  attachmentOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachmentPlayIcon: {
    color: Colors.white,
    fontSize: 40,
    shadowOpacity: 2,
    textShadowRadius: 4,
    textShadowOffset: { width: 2, height: 2 },
  },

  messageSenderName: {
    fontWeight: 'bold',
  },

  messageContentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageTime: {
    fontSize: 12,
    marginLeft: 4,
    opacity: 0.7,
  },
  messageMark: {
    marginLeft: 4,
  },

  fabScrollDown: {
    position: 'absolute',
    right: 9,
    bottom: 72,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingVertical: 3,
  },
  inputSurface: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    flex: 1,
    margin: 6,
    marginRight: 0,
    elevation: 2,
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    padding: 9,
    paddingHorizontal: 12,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },

  inputIconSurface: {
    alignSelf: 'flex-end',
    borderRadius: 36,
    margin: 6,
    elevation: 3,
  },
  inputIconButton: {
    margin: 0,
  },

  attachmentTypePickerContainer: {
    position: 'absolute',
    left: 6,
    right: 6,
    bottom: 64,
  },
  attachmentTypePicker: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    elevation: 3,
  },
  attachmentTypeIconContainer: {
    alignItems: 'center',
    margin: 12,
  },
  attachmentTypeIcon: {
    marginBottom: 6,
  },
});

export default styles;
