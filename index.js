import { AppRegistry } from 'react-native';

import App from './src/App';
import { setupBackgroundHandler } from './src/services/firebase';
import { name as appName } from './app.json';

setupBackgroundHandler();

AppRegistry.registerComponent(appName, () => App);
