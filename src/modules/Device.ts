import { NativeModules } from 'react-native';

interface DeviceModule {
  getDeviceName: () => Promise<string | undefined>;
}

export default NativeModules.DeviceModule as DeviceModule;
