import React, { FC, Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { BackHandler, ListRenderItem, Platform } from 'react-native';

import { FlatList } from 'react-native-gesture-handler';
import { Button, Divider, Portal } from 'react-native-paper';
import { useDatabase } from '@nozbe/watermelondb/hooks';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';

import HomeTabHeaderRight from '!/components/HomeTabHeaderRight';
import SlideIn from '!/components/SlideIn';
import { ROOM_AMOUNT_ANIMATE } from '!/config';
import useFocusEffect from '!/hooks/use-focus-effect';
import usePress from '!/hooks/use-press';
import useTranslation from '!/hooks/use-translation';
import RoomModel, { roomUpdater, updateRooms } from '!/models/RoomModel';
import { useStores } from '!/stores';
import { HomeTabNavigationProp, MuteUntilOption, StackHeaderRightProps } from '!/types';

import ChatsHeaderRight from './ChatsHeaderRight';
import MuteOptions from './MuteOptions';
import { withAllRooms, WithAllRoomsInput, WithAllRoomsOutput } from './queries';
import RoomItem from './RoomItem';
import styles from './styles';

const muteUntilOptions: MuteUntilOption[] = [
  { key: '1', value: [8, 'h'] },
  { key: '2', value: [1, 'w'] },
  { key: '3', value: [1, 'y'] },
];

const handleKeyExtractor = (item: RoomModel) => item.id;

const RoomList: FC<WithAllRoomsOutput> = ({ rooms, archivedOnly }) => {
  const database = useDatabase();
  const navigation = useNavigation<HomeTabNavigationProp<'Chats'>>();
  const { authStore } = useStores();
  const { t } = useTranslation();

  // Id of selected rooms
  const [selected, setSelected] = useState<string[]>([]);
  const [isAllSelectedMuted, setIsAllSelectedMuted] = useState(false);

  const [isMuteOptionsVisible, setIsMuteOptionsVisible] = React.useState(false);
  const [selectedMuteOption, setSelectedMuteOption] = React.useState<MuteUntilOption>(muteUntilOptions[0]);
  const [shouldStillNotify, setShouldStillNotify] = useState(false);

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

  const toggleSelected = useCallback(
    (roomId: string) => {
      setSelected((prev) => {
        const clone = [...prev];
        const index = prev.findIndex((e) => e === roomId);
        if (index > -1) {
          clone.splice(index, 1);
        } else {
          clone.push(roomId);
        }
        if (!clone.length) {
          setIsAllSelectedMuted(false);
        } else {
          setIsAllSelectedMuted(!clone.some((id) => !rooms.find((r) => r.id === id)?.isMuted));
        }
        return clone;
      });
    },
    [rooms],
  );

  // Mute options
  const handleShowMuteOptions = usePress(() => {
    setSelectedMuteOption(muteUntilOptions[0]);
    setShouldStillNotify(false);
    requestAnimationFrame(() => {
      setIsMuteOptionsVisible(true);
    });
  });

  const handleHideMuteOptions = usePress(() => {
    setIsMuteOptionsVisible(false);
  });

  const handleChangeMuteOption = usePress((key) => {
    requestAnimationFrame(() => {
      setSelectedMuteOption(muteUntilOptions.find((e) => e.key === key)!);
    });
  });

  const toggleShouldStillNotify = usePress(() => {
    requestAnimationFrame(() => {
      setShouldStillNotify((prev) => !prev);
    });
  });

  const handleUnmuteSelected = usePress(async () => {
    const batch = rooms.map((room) => {
      if (selected.includes(room.id)) {
        return room.prepareUpdate(
          roomUpdater({
            isMuted: false,
            mutedUntil: null,
            shouldStillNotify: false,
          }),
        );
      }
      return null;
    });

    setSelected(() => []);

    await database.action(async () => {
      await database.batch(...(batch as RoomModel[]));
    });
  });

  const handleMuteSelected = usePress(async () => {
    handleHideMuteOptions();

    const mutedUntil = moment()
      .add(...selectedMuteOption.value)
      .valueOf();

    const batch = rooms.map((room) => {
      if (selected.includes(room.id)) {
        return room.prepareUpdate(
          roomUpdater({
            isMuted: true,
            mutedUntil,
            shouldStillNotify,
          }),
        );
      }
      return null;
    });

    setSelected(() => []);

    await database.action(async () => {
      await database.batch(...(batch as RoomModel[]));
    });
  });

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
            handleDeselectAll={handleDeselectAll}
            handleSelectAll={handleSelectAll}
            handleShowMuteOptions={handleShowMuteOptions}
            handleUnmuteSelected={handleUnmuteSelected}
            isAllSelectedMuted={isAllSelectedMuted}
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
    handleDeselectAll,
    handlePressBackHeader,
    handleSelectAll,
    handleShowMuteOptions,
    handleUnmuteSelected,
    isAllSelectedMuted,
    navigation,
    selected.length,
    t,
  ]);

  // Unmute rooms that are past it's date limit
  useEffect(() => {
    const batch = rooms.map((room) => {
      if (room.mutedUntil && room.mutedUntil < Date.now()) {
        return room.prepareUpdate(
          roomUpdater({
            isMuted: false,
            shouldStillNotify: false,
            mutedUntil: null,
          }),
        );
      }
      return null;
    });
    void database.action(async () => {
      await database.batch(...(batch as RoomModel[]));
    });
  }, [database, rooms]);

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
    ({ item, index }) => {
      const Component = index < ROOM_AMOUNT_ANIMATE ? SlideIn : Fragment;
      return (
        <Component>
          <RoomItem
            database={database}
            getSelected={getSelected}
            isSelecting={selected.length > 0}
            room={item}
            signedUser={authStore.user}
            toggleSelected={toggleSelected}
          />
        </Component>
      );
    },
    [authStore.user, database, getSelected, selected.length, toggleSelected],
  );

  return (
    <>
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
        removeClippedSubviews={Platform.OS === 'android'}
        renderItem={renderItem}
        updateCellsBatchingPeriod={100}
        windowSize={16}
      />

      <Portal>
        <MuteOptions
          handleChangeMuteOption={handleChangeMuteOption}
          handleHideMuteOptions={handleHideMuteOptions}
          handleMuteSelected={handleMuteSelected}
          isMuteOptionsVisible={isMuteOptionsVisible}
          muteUntilOptions={muteUntilOptions}
          selectedMuteOption={selectedMuteOption}
          shouldStillNotify={shouldStillNotify}
          toggleShouldStillNotify={toggleShouldStillNotify}
        />
      </Portal>
    </>
  );
};

export default withAllRooms(RoomList) as FC<WithAllRoomsInput>;
