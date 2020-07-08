import Config from 'react-native-config';
import debug from 'debug';

if (Config.DEBUG_NAMESPACES) {
  debug.enable(Config.DEBUG_NAMESPACES + ',-app:synchronize');
}

export default debug('app');
