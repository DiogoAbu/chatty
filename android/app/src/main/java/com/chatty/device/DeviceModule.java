package com.chatty.device;

import android.os.Build;
import android.provider.Settings;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

// https://github.com/react-native-community/react-native-device-info/blob/master/android/src/main/java/com/learnium/RNDeviceInfo/RNDeviceModule.java
public class DeviceModule extends ReactContextBaseJavaModule {
  public DeviceModule(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  public String getName() {
    return "DeviceModule";
  }

  @ReactMethod
  public void getDeviceName(Promise p) {
    try {
      String bluetoothName = Settings.Secure.getString(getReactApplicationContext().getContentResolver(), "bluetooth_name");
      if (bluetoothName != null) {
        p.resolve(bluetoothName);
        return;
      }

      if (Build.VERSION.SDK_INT >= 25) {
        String deviceName = Settings.Global.getString(getReactApplicationContext().getContentResolver(), Settings.Global.DEVICE_NAME);
        if (deviceName != null) {
          p.resolve(deviceName);
          return;
        }
      }
    } catch (Exception e) {
      // same as default unknown return
    }
    p.resolve(null);
    return;
  }
}
