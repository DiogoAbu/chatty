import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  contentContainerStyle: {
    flexGrow: 1,
  },

  itemContentContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },

  roomIconSelected: {
    elevation: 1,
    position: 'absolute',
    left: 58 - 24,
    bottom: 0,
  },

  roomRightContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  roomRightDetailsContainer: {
    flexDirection: 'row',
    paddingBottom: 4,
  },
  roomRightIcon: {
    opacity: 0.8,
  },

  marginRight: {
    marginRight: 4,
  },

  lastMessageEncrypted: {
    fontStyle: 'italic',
  },
  lastMessageAttachmentIcon: {
    fontSize: 18,
  },

  roomSentAt: {
    flex: 0,
  },

  roomMessagesBadge: {
    marginVertical: 0,
    marginRight: 4,
    marginLeft: 4,
    marginBottom: 4,
    lineHeight: 17,
  },

  roomArchivedChip: {
    backgroundColor: 'transparent',
  },
  roomArchivedChipText: {
    marginVertical: 0,
    marginRight: 4,
    marginLeft: 4,
  },

  headerActionsContainer: {
    flexDirection: 'row',
  },
});

export default styles;
