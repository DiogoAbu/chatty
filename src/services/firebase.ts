import PushNotification from 'react-native-push-notification';
import { Database } from '@nozbe/watermelondb';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { Client } from 'urql';

import MessageModel from '!/models/MessageModel';
import { roomUpdater } from '!/models/RoomModel';
import debug from '!/services/debug';
import sync from '!/services/sync';
import { Stores } from '!/stores/Stores';
import { Tables } from '!/types';

import { navigationRef, rootNavigate } from '../utils/root-navigation';
import timeout from '../utils/timeout';

const log = debug.extend('push-notifications');

const CHECK_MESSAGE_MAX_AMOUNT = 10;

export type PushData = {
  title: string;
  senderId: string;
  messageId: string;
  roomId: string;
};

/**
 * Request permission
 */
export async function requestMessagingPermission(): Promise<boolean> {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  return enabled;
}

/**
 * Get device token and subscribe to it`s refresh event
 */
export function subscribeDeviceToken(callback: (deviceToken: string) => Promise<void>): () => void {
  // Get the device token
  void messaging()
    .getToken()
    .then(async (deviceToken) => {
      return callback(deviceToken);
    });

  // Listen to whether the token changes
  return messaging().onTokenRefresh(async (token) => {
    await callback(token);
  });
}

/**
 * Listen to cloud messages when App is on foregroud state
 */
export function subscribeForegroundMessage(userId: string, database: Database, client: Client): () => void {
  return messaging().onMessage((remoteMessage) => {
    void displayNotification(remoteMessage, userId, database, client);
  });
}

/**
 * Listen to cloud messages when App is on background or quit state
 */
export function setupBackgroundHandler(): void {
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    log('Background handler called');
    return new Promise((resolve) => {
      const stores = new Stores();
      stores.onHydrationComplete = async () => {
        log('hydration complete');
        const userId = stores.authStore.user?.id;
        const database = stores.generalStore.database;
        const client = stores.generalStore.client;
        await displayNotification(remoteMessage, userId, database, client);
        resolve();
      };
    });
  });
}

/**
 * Listen to taps on notifications, and when a notification opens the app
 */
export function setupNotificationTap(): void {
  PushNotification.configure({
    onNotification(notification) {
      log('Tapped notification');
      if (notification?.data) {
        const { roomId } = notification.data as PushData;
        rootNavigate('Chatting', { roomId });
      }

      // Required
      notification.finish(PushNotificationIOS.FetchResult.NoData);
    },
  });

  PushNotification.popInitialNotification((notification) => {
    log('Initial notification');
    if (notification?.data) {
      const { roomId } = notification.data as PushData;
      rootNavigate('Chatting', { roomId });
    }
  });
}

/**
 * Displays a local notification
 */
async function displayNotification(
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
  userId: string,
  database: Database,
  client: Client,
) {
  const { collapseKey, data } = remoteMessage;

  const { title, senderId, messageId, roomId } = data as PushData;

  // Only show notification if user is not already in the room
  if (isRequestedRoomFocused(roomId)) {
    log('Room is current screen');
    return;
  }

  if (!userId) {
    log('No signed user found');
    return;
  } else if (senderId === userId) {
    // log('Signed user sent the message, skip displaying notification');
    // return;
  }

  const messagesTable = database.collections.get<MessageModel>(Tables.messages);

  let amount = 0;
  let message: MessageModel | null = null;
  while (!message) {
    await sync(userId, database, client);

    try {
      message = await messagesTable.find(messageId);
    } catch {
      message = null;
    }

    if (!message) {
      if (amount > CHECK_MESSAGE_MAX_AMOUNT) {
        log('Message does not exist, skip displaying notification');
        return;
      }
      amount += 1;
      await timeout(1000);
    }
  }

  if (message.type === 'sharedKey') {
    log('Message is not valid', { type: message.type });
    return;
  }

  // Get room of the message to check if it's muted
  const room = await message.room.fetch();

  let isMuted = false;
  let shouldStillNotify = false;

  // Unmute if date has passed
  if (room?.mutedUntil && room.mutedUntil < Date.now()) {
    isMuted = false;
    shouldStillNotify = false;
    await database.action(async () => {
      await room?.update(
        roomUpdater({
          isMuted,
          shouldStillNotify,
          mutedUntil: null,
        }),
      );
    });
  } else {
    isMuted = room?.isMuted ?? false;
    shouldStillNotify = room?.shouldStillNotify ?? false;
  }

  if (isMuted && !shouldStillNotify) {
    log('Room is mutted', { isMuted, shouldStillNotify });
    return;
  }

  // Get attachments to show picture on notification
  const attachments = await message.attachments.fetch();
  if (!message.content && !attachments.length) {
    log('Message is not valid', { hasContent: !!message.content, attachmentAmount: attachments.length });
    return;
  }

  let bigPictureUrl;
  if (attachments.length) {
    const attachmentFound = attachments.find((e) => e.uri && e.type === 'image');
    if (attachmentFound) {
      bigPictureUrl = attachmentFound.uri;
    } else {
      log('No valid uri for attachment found');
    }
  }

  PushNotification.localNotification({
    /* iOS and Android properties */
    title,
    message: message.content,
    playSound: !isMuted,
    soundName: 'default',

    // @ts-ignore @types not up-to-date
    data,

    /* Android Only Properties */
    showWhen: true,
    autoCancel: true,
    vibrate: !isMuted,
    vibration: 300,
    group: collapseKey,
    ongoing: false,
    ignoreInForeground: false,
    onlyAlertOnce: false,

    bigPictureUrl,
  });
}

/**
 * Whether Chatting screen is focused with the room id as parameter
 */
function isRequestedRoomFocused(roomId?: string) {
  const state = navigationRef?.current?.getRootState?.();
  if (!state || !roomId) {
    return false;
  }
  const route = state.routes[state.index];
  return route.name === 'Chatting' && (route.params as any).roomId === roomId;
}
