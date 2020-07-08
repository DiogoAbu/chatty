import React, { FC, useCallback, useEffect, useState } from 'react';
import { ListRenderItemInfo, Platform, View } from 'react-native';

import { FlatList } from 'react-native-gesture-handler';
import { Banner, Divider, FAB as Fab, Snackbar, Title } from 'react-native-paper';

import Loading from '!/components/Loading';
import { useListUsersQuery, User } from '!/generated/graphql';
import { useBackHandlerOnFocus } from '!/hooks/use-back-handler';
import useDebounceValue from '!/hooks/use-debounce-value';
import useFocusEffect from '!/hooks/use-focus-effect';
import useInput from '!/hooks/use-input';
import usePress from '!/hooks/use-press';
import useTheme from '!/hooks/use-theme';
import useTranslation from '!/hooks/use-translation';
import debug from '!/services/debug';
import { useStores } from '!/stores';
import { MainNavigationProp } from '!/types';

import FriendItem from './FriendItem';
import HeaderSearch from './HeaderSearch';
import styles from './styles';

const log = debug.extend('find-friends');

const handleKeyExtractor = (item: User) => item.id!;

interface Props {
  navigation: MainNavigationProp<'FindFriends'>;
}

const FindFriends: FC<Props> = ({ navigation }) => {
  const { generalStore, authStore } = useStores();
  const { colors } = useTheme();
  const { t } = useTranslation();

  const query = useInput('');
  const queryDebounced = useDebounceValue(query.value);

  const [selectedList, setSelectedList] = useState<User[]>([]);

  const [showOnlySelected, setShowOnlySelected] = useState(false);
  const [snackVisible, setSnackVisible] = useState(false);

  const [{ data, fetching }, execListUsers] = useListUsersQuery({
    pause: true,
    variables: { where: { name: `${query.value.trim()}%`, email: `${query.value.trim()}%` } },
  });

  // Update selected friend and selected amount
  const toggleSelected = useCallback((friend: User) => {
    setSelectedList((prev) => {
      const next = [...prev];
      const index = next.findIndex((e) => e === friend.id);
      if (index >= 0) {
        next.splice(index, 1);
      } else {
        next.push(friend);
      }
      return next;
    });
  }, []);

  // Navigate to create group
  const handleGroupPress = usePress(() => {
    requestAnimationFrame(() => {
      if (selectedList.length === 0) {
        setSnackVisible(true);
        return;
      }
      const members = data?.listUsers?.filter((e) => selectedList.some((b) => b.id === e.id)) as User[];
      navigation.navigate('CreateGroup', { members });
      setSelectedList([]);
    });
  });

  // Hide FAB
  useEffect(() => {
    generalStore.setFab();
  }, [generalStore]);

  // If is selecting android back button will clear the selection
  useBackHandlerOnFocus(() => {
    if (selectedList.length > 0) {
      requestAnimationFrame(() => {
        setSelectedList([]);
      });
      return true;
    }
    return false;
  }, [selectedList.length]);

  useFocusEffect(() => {
    navigation.setOptions({
      header: (props) => (
        <HeaderSearch {...props} {...query} badge={selectedList.length} onGroupIconPress={handleGroupPress} />
      ),
    });

    // Cannot have a blur function
  }, [handleGroupPress, navigation, query, selectedList.length]);

  useEffect(() => {
    if (queryDebounced.trim()) {
      log('getting user list for ' + queryDebounced);
      execListUsers({ requestPolicy: 'network-only' });
    }

    // ignore execListUsers
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryDebounced]);

  const renderItem = ({ item }: ListRenderItemInfo<User>) => (
    <FriendItem
      friend={item}
      isSelected={selectedList.some((e) => e.id === item.id)}
      isSelecting={selectedList.length > 0}
      toggleSelected={toggleSelected}
    />
  );

  return (
    <>
      <FlatList
        contentContainerStyle={styles.contentContainerStyle}
        contentInsetAdjustmentBehavior='automatic'
        data={
          showOnlySelected
            ? selectedList
            : queryDebounced.trim() && !fetching
            ? data?.listUsers?.filter((e) => e.id !== authStore.user.id) || []
            : []
        }
        extraData={selectedList}
        initialNumToRender={10}
        ItemSeparatorComponent={Divider}
        keyboardShouldPersistTaps='handled'
        keyExtractor={handleKeyExtractor}
        ListEmptyComponent={
          fetching ? (
            <Loading />
          ) : (
            <View style={styles.centerCenter}>
              <Fab color={colors.textOnAccent} icon='magnify' />
              <Title style={styles.nearTitle}>{t('label.findPeopleNearYou')}</Title>
            </View>
          )
        }
        ListHeaderComponent={
          <Banner
            actions={[
              {
                label: showOnlySelected ? 'Show everyone' : 'Show only selected',
                onPress: () => {
                  requestAnimationFrame(() => {
                    setShowOnlySelected((prev) => !prev);
                  });
                },
              },
            ]}
            visible={selectedList.length > 0}
          >
            You are selecting people to create a group.
          </Banner>
        }
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
