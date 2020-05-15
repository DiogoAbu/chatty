import React, {
  FC,
  MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ListRenderItem,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  SectionList,
  SectionListData,
} from 'react-native';

import { FAB as FabPaper } from 'react-native-paper';
import { ExtractedObservables } from '@nozbe/with-observables';
import throttle from 'lodash.throttle';

import usePress from '!/hooks/use-press';
import useTheme from '!/hooks/use-theme';
import MessageModel from '!/models/MessageModel';
import deepCompare from '!/utils/deep-compare';
import getSectionDate from '!/utils/get-section-date';

import { AttachmentPickerType } from './AttachmentPicker';
import MessageItem from './MessageItem';
import { withMessages, WithMessagesOutput } from './queries';
import SectionDateItem from './SectionDateItem';
import styles from './styles';

// Types
type PropsExtra = {
  title: string;
  updateReadTime: () => void;
  attachmentPickerRef: MutableRefObject<AttachmentPickerType | null>;
};

type Props = ExtractedObservables<WithMessagesOutput & PropsExtra>;

type SectionData = {
  isPreviousSameSender: boolean;
  message: MessageModel;
};

// Helper functions
const handleKeyExtractor = (item: SectionData) => item.message.id;

const renderSectionTitle = ({ section }: { section: SectionListData<SectionData> }) => (
  <SectionDateItem section={section} />
);

const isScrollNearBottom = ({ contentOffset }: NativeScrollEvent) => {
  const paddingToBottom = 32;
  return contentOffset.y <= paddingToBottom;
};

// Main Component
const MessageList: FC<Props> = ({ messages, title, updateReadTime, attachmentPickerRef }) => {
  const { colors } = useTheme();

  const contentHeight = useRef(0);
  const scrollY = useRef(0);
  const listRef = useRef<SectionList<SectionData> | null>(null);

  const [isNearBottom, setIsNearBottom] = useState(true);

  const messagesSorted = useMemo(() => {
    if (!messages) {
      return [];
    }
    const sorted = [...messages].sort((a, b) => b.localCreatedAt - a.localCreatedAt);

    // Will receive messages separated by date
    const sections = sorted.reduce<Record<string, SectionData[]>>((accu, message, index, array) => {
      const sectionTitle = getSectionDate(message.localCreatedAt);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deepCompare(messages, 'content')]);

  // Handlers
  const handleOnScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    event.persist();
    throttle(() => {
      contentHeight.current = event.nativeEvent.contentSize.height;
      scrollY.current = event.nativeEvent.contentOffset.y;
      const nearBottom = isScrollNearBottom(event.nativeEvent);
      setIsNearBottom(() => nearBottom);
    }, 1000)();
  }, []);

  const handleScrollToEnd = usePress(() => {
    listRef.current?.getScrollResponder()?.scrollTo({ y: 0, animated: true });
  });

  const handleContentSizeChange = useCallback(
    (_, newHeight: number) => {
      if (!isNearBottom) {
        const y = newHeight - contentHeight.current;
        contentHeight.current = newHeight;

        requestAnimationFrame(() => {
          listRef.current
            ?.getScrollResponder()
            ?.scrollTo({ y: scrollY.current + y, animated: false });
        });
      }
    },
    [isNearBottom],
  );

  useEffect(() => {
    updateReadTime();
  }, [updateReadTime, messagesSorted]);

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
        contentContainerStyle={styles.contentContainerStyle}
        contentInsetAdjustmentBehavior='automatic'
        initialNumToRender={10}
        inverted
        keyExtractor={handleKeyExtractor}
        maxToRenderPerBatch={2}
        onContentSizeChange={handleContentSizeChange}
        onScroll={handleOnScroll}
        ref={listRef}
        removeClippedSubviews={Platform.OS === 'android'}
        renderItem={renderItem}
        renderSectionFooter={renderSectionTitle}
        scrollEventThrottle={0}
        sections={messagesSorted}
        updateCellsBatchingPeriod={100}
        windowSize={16}
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

export default withMessages(MessageList);
