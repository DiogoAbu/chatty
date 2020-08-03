import { FC, useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { useRegisterDeviceMutation } from '!/generated/graphql';
import Device from '!/modules/Device';
import {
  requestMessagingPermission,
  setupNotificationTap,
  subscribeDeviceToken,
  subscribeForegroundMessage,
} from '!/services/firebase';
import { useStores } from '!/stores';
import capitalize from '!/utils/capitalize';

interface Props {
  token: string;
  userId: string;
}

const NotificationsManager: FC<Props> = ({ token, userId }) => {
  const { authStore, deviceTokenStore, generalStore } = useStores();

  const [permissionGranted, setPermissionGranted] = useState(false);

  const [, registerDevice] = useRegisterDeviceMutation();

  // Request permission
  useEffect(() => {
    if (!token || !userId) {
      return;
    }

    void requestMessagingPermission().then((state) => {
      setPermissionGranted(state);
    });
  }, [token, userId]);

  // Subscribe to events
  useEffect(() => {
    if (!token || !userId || !permissionGranted) {
      return () => null;
    }

    const unsubscribeDeviceToken = subscribeDeviceToken(async (deviceToken) => {
      authStore.setDeviceToken(deviceToken);
      deviceTokenStore.addDeviceToken(deviceToken);

      const name = (await Device.getDeviceName()) || capitalize(Platform.OS);

      try {
        await registerDevice({
          data: { name, token: deviceToken, platform: Platform.OS },
        });

        // Unregister old tokens
        void deviceTokenStore.unregister();
        console.log('Device registered successfully', { name });
      } catch (err) {
        console.log('Device registration error', err);
      }
    });

    const unsubscribeForegroundMessage = subscribeForegroundMessage(
      userId,
      generalStore.database,
      generalStore.client,
    );

    setupNotificationTap();

    return () => {
      unsubscribeDeviceToken();
      unsubscribeForegroundMessage();
    };
  }, [authStore, deviceTokenStore, generalStore, permissionGranted, registerDevice, token, userId]);

  return null;
};

export default NotificationsManager;
