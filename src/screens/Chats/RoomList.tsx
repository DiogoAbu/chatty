import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { BackHandler, ListRenderItem } from 'react-native';

import { FlatList } from 'react-native-gesture-handler';
import { Button, Divider } from 'react-native-paper';
import { useDatabase } from '@nozbe/watermelondb/hooks';
import { useNavigation } from '@react-navigation/native';

import HomeTabHeaderRight from '!/components/HomeTabHeaderRight';
import useFocusEffect from '!/hooks/use-focus-effect';
import usePress from '!/hooks/use-press';
import useTranslation from '!/hooks/use-translation';
import RoomModel, { removeRoomsCascade, updateRooms } from '!/models/RoomModel';
import { useStores } from '!/stores';
import { HomeTabNavigationProp, StackHeaderRightProps } from '!/types';
import { isAndroid } from '!/utils/platform';

import ChatsHeaderRight from './ChatsHeaderRight';
import { withAllRooms, WithAllRoomsInput, WithAllRoomsOutput } from './queries';
import RoomItem from './RoomItem';
import styles from './styles';

const handleKeyExtractor = (item: RoomModel) => item.id;

const RoomList: FC<WithAllRoomsOutput> = ({ rooms, archivedOnly }) => {
  const database = useDatabase();
  const navigation = useNavigation<HomeTabNavigationProp<'Chats'>>();
  const { authStore } = useStores();
  const { t } = useTranslation();

  // Id of selected rooms
  const [selected, setSelected] = useState<string[]>([]);

  // Sort and prepare room array
  const [roomsSorted, roomsArchived] = useMemo(() => {
    const archived: RoomModel[] = [];

    const available = rooms.filter((room) => {
      if (room.isArchived) {
        archived.push(room);
        return false;
      }
      return true;
    });

    return [available, archived];
  }, [rooms]);

  // Selection
  const getSelected = useCallback(
    (roomId: string) => {
      return selected.findIndex((e) => e === roomId) > -1;
    },
    [selected],
  );

  const toggleSelected = useCallback((roomId: string) => {
    setSelected((prev) => {
      const clone = [...prev];
      const index = prev.findIndex((e) => e === roomId);
      if (index > -1) {
        clone.splice(index, 1);
      } else {
        clone.push(roomId);
      }
      return clone;
    });
  }, []);

  // Header selection
  const handleSelectAll = usePress(() => {
    requestAnimationFrame(() => {
      setSelected(() => rooms.map((e) => e.id));
    });
  });

  const handleDeselectAll = usePress(() => {
    requestAnimationFrame(() => {
      setSelected(() => []);
    });
  });

  const handleDeleteSelected = usePress(async () => {
    await removeRoomsCascade(database, selected, authStore.user.id);

    requestAnimationFrame(() => {
      setSelected(() => []);
    });
  });

  const handleArchiveSelected = usePress(async () => {
    // Showing only archived, we should unarchive them
    const isArchived = !archivedOnly;

    await updateRooms(database, selected, { isArchived });

    requestAnimationFrame(() => {
      setSelected(() => []);
    });
  });

  const handleSeeArchived = usePress(() => {
    requestAnimationFrame(() => {
      navigation.push('ChatsArchived');
    });
  });

  const handlePressBackHeader = usePress(() => {
    requestAnimationFrame(() => {
      setSelected(() => []);
    });
  });

  // Update header buttons
  useEffect(() => {
    const nav = archivedOnly ? navigation : navigation.dangerouslyGetParent();

    // Show buttons only once when going from 0 to 1
    if (selected.length) {
      // Update navigation options
      nav?.setOptions({
        title: selected.length,
        handlePressBack: handlePressBackHeader,
        headerRight: (props: StackHeaderRightProps) => (
          <ChatsHeaderRight
            {...props}
            archivedOnly={archivedOnly}
            handleArchiveSelected={handleArchiveSelected}
            handleDeleteSelected={handleDeleteSelected}
            handleDeselectAll={handleDeselectAll}
            handleSelectAll={handleSelectAll}
          />
        ),
      });
    } else if (selected.length <= 0) {
      // Update navigation options
      nav?.setOptions({
        title: archivedOnly ? t('title.chatsArchived') : 'Chatty',
        handlePressBack: undefined,
        headerRight: (props: StackHeaderRightProps) => (
          <HomeTabHeaderRight {...props} navigation={navigation} />
        ),
      });
    }
  }, [
    archivedOnly,
    handleArchiveSelected,
    handleDeleteSelected,
    handleDeselectAll,
    handlePressBackHeader,
    handleSelectAll,
    navigation,
    selected.length,
    t,
  ]);

  useFocusEffect(() => {
    // If selecting, android back button will clear the selection
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (selected.length > 0) {
        handlePressBackHeader();
        return true;
      }
      return false;
    });

    if (archivedOnly && roomsArchived.length === 0) {
      requestAnimationFrame(() => {
        navigation.popToTop();
      });
    }

    return () => {
      backHandler.remove();
    };
  }, [archivedOnly, handlePressBackHeader, navigation, roomsArchived.length, selected.length]);

  const renderItem: ListRenderItem<RoomModel> = useCallback(
    ({ item }) => (
      <RoomItem
        database={database}
        getSelected={getSelected}
        isSelecting={selected.length > 0}
        room={item}
        signedUser={authStore.user}
        toggleSelected={toggleSelected}
      />
    ),
    [authStore.user, database, getSelected, selected.length, toggleSelected],
  );

  return (
    <FlatList
      contentContainerStyle={styles.contentContainerStyle}
      contentInsetAdjustmentBehavior='automatic'
      data={archivedOnly ? roomsArchived : roomsSorted}
      initialNumToRender={10}
      ItemSeparatorComponent={Divider}
      keyExtractor={handleKeyExtractor}
      ListFooterComponent={
        !archivedOnly && roomsArchived.length ? (
          <Button compact mode='text' onPress={handleSeeArchived} uppercase={false}>
            {t('label.archivedNumber', { count: roomsArchived.length })}
          </Button>
        ) : null
      }
      maxToRenderPerBatch={2}
      removeClippedSubviews={isAndroid}
      renderItem={renderItem}
      updateCellsBatchingPeriod={100}
      windowSize={16}
    />
  );
};

export default withAllRooms(RoomList) as FC<WithAllRoomsInput>;
