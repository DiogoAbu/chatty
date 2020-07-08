import React, { FC, useCallback, useRef, useState } from 'react';
import {
  ListRenderItem,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  SectionList,
  SectionListData,
} from 'react-native';

import { FAB as FabPaper } from 'react-native-paper';
import { useDatabase } from '@nozbe/watermelondb/hooks';
import Bottleneck from 'bottleneck';
import { useClient } from 'urql';

import useMethod from '!/hooks/use-method';
import usePress from '!/hooks/use-press';
import useTheme from '!/hooks/use-theme';
import MessageModel from '!/models/MessageModel';
import { useStores } from '!/stores';
import getSectionDate from '!/utils/get-section-date';

import MessageItem from './MessageItem';
import { withMessages, WithMessagesInput, WithMessagesOutput } from './queries';
import SectionDateItem from './SectionDateItem';
import styles from './styles';

const limiter = new Bottleneck({
  maxConcurrent: 1,
});

type SectionData = {
  isPreviousSameSender: boolean;
  message: MessageModel;
};

const paddingToTop = 64;
const paddingToBottom = 32;

// Helper functions
const sortMessages = (messages: MessageModel[]) => {
  if (!messages?.length) {
    return [];
  }

  // Will receive messages separated by date
  const sections = messages.reduce<Record<string, SectionData[]>>((accu, message, index, array) => {
    const sectionTitle = getSectionDate(message.createdAt);

    let isPreviousSameSender = false;
    if (index < array.length) {
      isPreviousSameSender = array[index + 1]?.sender.id === message.sender.id;
    }

    if (!accu[sectionTitle]) {
      accu[sectionTitle] = [{ isPreviousSameSender, message }];
    } else {
      accu[sectionTitle].push({ isPreviousSameSender, message });
    }

    return accu;
  }, {});

  // Prepare title and data for section list
  return Object.entries(sections).map(([sectionTitle, data]) => {
    return { title: sectionTitle, data };
  });
};

const handleKeyExtractor = (item: SectionData) => item.message.id;

const renderSectionTitle = ({ section }: { section: SectionListData<SectionData> }) => (
  <SectionDateItem section={section} />
);

// Main Component
const MessageList: FC<WithMessagesOutput> = ({ room, messages, title, attachmentPickerRef, setPage }) => {
  const client = useClient();
  const database = useDatabase();
  const { authStore } = useStores();
  const { colors } = useTheme();

  const contentHeight = useRef(0);
  const scrollY = useRef(0);
  const listRef = useRef<SectionList<SectionData> | null>(null);

  const [isNearBottom, setIsNearBottom] = useState(true);

  const messagesSorted = sortMessages(messages);

  // Handlers
  // const scrollDebounced = useMethod(
  //   throttle((event: NativeSyntheticEvent<NativeScrollEvent>) => {
  //     const { layoutMeasurement, contentSize, contentOffset } = event.nativeEvent;

  //     // If new Y is greater than stored Y
  //     const isGoingUp = contentOffset.y > scrollY.current;

  //     contentHeight.current = contentSize.height;
  //     scrollY.current = contentOffset.y;

  //     setIsNearBottom(() => isScrollNearBottom(event.nativeEvent));

  //     const maxScroll = Math.floor(contentHeight.current - layoutMeasurement.height) - paddingToTop;
  //     if (isGoingUp && scrollY.current >= maxScroll) {
  //       setPage((prev) => prev + 1);
  //     }
  //   }, 300),
  // );

  const handleOnScroll = useMethod((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentSize, contentOffset } = event.nativeEvent;

    // Get new height and new scroll position
    contentHeight.current = contentSize.height;
    scrollY.current = contentOffset.y;

    setIsNearBottom(contentOffset.y <= paddingToBottom);
  });

  const handleContentSizeChange = useMethod((_, newHeight: number) => {
    const notNearBottom = scrollY.current > paddingToBottom;
    const contentHeightIncreased = newHeight > contentHeight.current;
    if (notNearBottom && contentHeightIncreased) {
      const deltaHeight = newHeight - contentHeight.current;

      contentHeight.current = newHeight;
      scrollY.current = scrollY.current + deltaHeight;

      requestAnimationFrame(() => {
        listRef.current?.getScrollResponder()?.scrollTo({ y: scrollY.current, animated: false });
      });
    }
  });

  const handleScrollToEnd = usePress(() => {
    listRef.current?.getScrollResponder()?.scrollTo({ y: 0, animated: true });
  });

  // useEffect(() => {
  //   const markAsSeen = async () => {
  //     const wrapped = limiter.wrap(async (msg: MessageModel) => {
  //       if (msg.sender.id !== authStore.user.id) {
  //         return msg.prepareMarkAsSeen(authStore.user.id);
  //       }
  //       return (null as unknown) as ReadReceiptModel;
  //     });

  //     const batch = await Promise.all(messages.map(wrapped));

  //     const roomUpdate = room.prepareUpdate(
  //       roomUpdater({
  //         lastReadAt: Date.now(),
  //         _raw: {
  //           _status: room._raw._status === 'synced' ? 'synced' : 'updated',
  //         },
  //       }),
  //     );

  //     await database.action(async () => {
  //       await database.batch(roomUpdate, ...batch);
  //     }, 'MessageList -> prepareMarkAsSeen');

  //     await sync(authStore.user.id, database, client);
  //   };
  //   void markAsSeen();
  // }, [authStore.user.id, client, database, messages, room]);

  // Renders
  const renderItem: ListRenderItem<SectionData> = useCallback(
    ({ item }) => (
      <MessageItem
        attachmentPickerRef={attachmentPickerRef}
        isPreviousSameSender={item.isPreviousSameSender}
        message={item.message}
        title={title}
      />
    ),
    [attachmentPickerRef, title],
  );

  return (
    <>
      <SectionList
        automaticallyAdjustContentInsets={false}
        contentContainerStyle={styles.contentContainerStyle}
        contentInsetAdjustmentBehavior='automatic'
        initialNumToRender={10}
        inverted
        keyExtractor={handleKeyExtractor}
        maxToRenderPerBatch={2}
        ref={listRef}
        removeClippedSubviews={Platform.OS === 'android'}
        renderItem={renderItem}
        renderSectionFooter={renderSectionTitle}
        scrollEventThrottle={20}
        sections={messagesSorted}
        updateCellsBatchingPeriod={100}
        windowSize={16}
        {...(Platform.OS === 'ios'
          ? {
              maintainVisibleContentPosition: { minIndexForVisible: 0 },
            }
          : {
              onScroll: handleOnScroll,
              onContentSizeChange: handleContentSizeChange,
            })}
      />

      <FabPaper
        color={colors.textOnAccent}
        icon='chevron-down'
        onPress={handleScrollToEnd}
        small
        style={styles.fabScrollDown}
        visible={!isNearBottom}
      />
    </>
  );
};

export default withMessages(MessageList) as FC<WithMessagesInput>;
