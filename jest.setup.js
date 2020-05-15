jest.mock('./src/services/database');

jest.mock('react-native-config', () => {
  return {
    API_URL: 'API_URL',
    SUBS_URL: 'SUBS_URL',
  };
});

jest.mock('react-native-reanimated', () => {
  const View = require('react-native').View;

  return {
    Value: jest.fn(),
    event: jest.fn(),
    add: jest.fn(),
    eq: jest.fn(),
    set: jest.fn(),
    cond: jest.fn(),
    interpolate: jest.fn(),
    View,
    Extrapolate: { CLAMP: jest.fn() },
    Clock: jest.fn(),
    greaterThan: jest.fn(),
    lessThan: jest.fn(),
    startClock: jest.fn(),
    stopClock: jest.fn(),
    clockRunning: jest.fn(),
    not: jest.fn(),
    or: jest.fn(),
    and: jest.fn(),
    spring: jest.fn(),
    decay: jest.fn(),
    defined: jest.fn(),
    call: jest.fn(),
    Code: View,
    block: jest.fn(),
    abs: jest.fn(),
    greaterOrEq: jest.fn(),
    lessOrEq: jest.fn(),
    debug: jest.fn(),
    Transition: {
      Together: 'Together',
      Out: 'Out',
      In: 'In',
    },
    Easing: {
      in: jest.fn(),
      out: jest.fn(),
      inOut: jest.fn(),
    },
  };
});

jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter.js', () => {
  const { EventEmitter } = require('events');
  return EventEmitter;
});

jest.mock('react-native-localize', () => {
  const getLocales = () => [
    // you can choose / add the locales you want
    { countryCode: 'US', languageTag: 'en-US', languageCode: 'en', isRTL: false },
  ];

  // use a provided translation, or return undefined to test your fallback
  const findBestAvailableLanguage = () => ({
    languageTag: 'en-US',
    isRTL: false,
  });

  const getNumberFormatSettings = () => ({
    decimalSeparator: '.',
    groupingSeparator: ',',
  });

  const getCalendar = () => 'gregorian'; // or "japanese", "buddhist"
  const getCountry = () => 'US'; // the country code you want
  const getCurrencies = () => ['USD']; // can be empty array
  const getTemperatureUnit = () => 'celsius'; // or "fahrenheit"
  const getTimeZone = () => 'America/New_York'; // the timezone you want
  const uses24HourClock = () => true;
  const usesMetricSystem = () => true;

  const addEventListener = jest.fn();
  const removeEventListener = jest.fn();

  return {
    findBestAvailableLanguage,
    getLocales,
    getNumberFormatSettings,
    getCalendar,
    getCountry,
    getCurrencies,
    getTemperatureUnit,
    getTimeZone,
    uses24HourClock,
    usesMetricSystem,
    addEventListener,
    removeEventListener,
  };
});
