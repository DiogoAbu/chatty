import React, { FC, useCallback, useEffect, useState } from 'react';
import { ListRenderItemInfo, Platform } from 'react-native';

import { FlatList } from 'react-native-gesture-handler';
import { Divider, Snackbar } from 'react-native-paper';

import { useBackHandlerOnFocus } from '!/hooks/use-back-handler';
import useFocusEffect from '!/hooks/use-focus-effect';
import useInput from '!/hooks/use-input';
import usePress from '!/hooks/use-press';
import useTranslation from '!/hooks/use-translation';
import { useStores } from '!/stores';
import { MainNavigationProp } from '!/types';

import data from './data.json';
import FriendItem from './FriendItem';
import HeaderSearch from './HeaderSearch';
import styles from './styles';

type Friend = {
  id: string;
  name: string;
  email: string;
  picture: string;
  publicKey: string;
  isSelected?: boolean;
};

const handleKeyExtractor = (item: Friend) => item.id;

interface Props {
  navigation: MainNavigationProp<'FindFriends'>;
}

const FindFriends: FC<Props> = ({ navigation }) => {
  const { generalStore } = useStores();
  const { t } = useTranslation();

  const query = useInput('');
  const [friends, setFriends] = useState(new Map<string, Friend>());
  const [selectedAmount, setSelectedAmount] = useState(0);

  const [snackVisible, setSnackVisible] = useState(false);

  // Update selected friend and selected amount
  const toggleSelected = useCallback(
    (userId: string) => {
      const friend = friends.get(userId)!;

      setFriends((prev) => {
        return prev.set(userId, {
          ...friend,
          isSelected: !friend?.isSelected,
        });
      });

      setSelectedAmount((prev) => (friend.isSelected ? prev - 1 : prev + 1));
    },
    [friends],
  );

  // Navigate to insert group name
  const handleGroupPress = usePress(() => {
    requestAnimationFrame(() => {
      if (selectedAmount === 0) {
        setSnackVisible(true);
        return;
      }
      const members = Array.from(friends.values()).filter((e) => e.isSelected);
      navigation.navigate('CreateGroup', { members });
    });
  });

  // Load initial members
  useEffect(() => {
    requestAnimationFrame(() => {
      const friendsMap = new Map<string, Friend>(data.map((each) => [each.id, each]));
      setSelectedAmount(0);
      setFriends(friendsMap);
    });
  }, []);

  // Hide FAB
  useEffect(() => {
    generalStore.setFab();
  }, [generalStore]);

  // If is selecting android back button will clear the selection
  useBackHandlerOnFocus(() => {
    if (selectedAmount > 0) {
      requestAnimationFrame(() => {
        setFriends((prev) => {
          for (const [id, friend] of prev) {
            prev.set(id, { ...friend, isSelected: false });
          }
          return prev;
        });

        setSelectedAmount(0);
      });
      return true;
    }
    return false;
  }, [selectedAmount]);

  useFocusEffect(() => {
    navigation.setOptions({
      header: (props) => (
        <HeaderSearch
          {...props}
          {...query}
          badge={selectedAmount}
          onGroupIconPress={handleGroupPress}
        />
      ),
    });
  }, [handleGroupPress, navigation, query, selectedAmount]);

  const renderItem = ({ item }: ListRenderItemInfo<Friend>) => (
    <FriendItem friend={item} isSelecting={selectedAmount > 0} toggleSelected={toggleSelected} />
  );

  return (
    <>
      <FlatList
        contentContainerStyle={styles.contentContainerStyle}
        contentInsetAdjustmentBehavior='automatic'
        data={Array.from(friends.values())}
        extraData={selectedAmount}
        initialNumToRender={10}
        ItemSeparatorComponent={Divider}
        keyExtractor={handleKeyExtractor}
        maxToRenderPerBatch={2}
        removeClippedSubviews={Platform.OS === 'android'}
        renderItem={renderItem}
        updateCellsBatchingPeriod={100}
        windowSize={16}
      />

      <Snackbar onDismiss={() => setSnackVisible(false)} visible={snackVisible}>
        {t('holdToCreateGroup.desc')}
      </Snackbar>
    </>
  );
};

export default FindFriends;
