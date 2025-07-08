// Import required for gesture handler
// import 'react-native-gesture-handler/jestSetup';

// Mock react-native modules
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock vector icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'MaterialIcons');
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'MaterialCommunityIcons');

// Mock react-native modules
jest.mock('react-native', () => {
  return {
    Platform: {
      OS: 'android',
      select: jest.fn((config) => config.android),
    },
    NativeModules: {
      LocalAIModule: {
        initialize: jest.fn(() => Promise.resolve(true)),
        loadModel: jest.fn(() => Promise.resolve(true)),
        unloadModel: jest.fn(() => Promise.resolve(true)),
        generateText: jest.fn(() => Promise.resolve({
          text: 'مرحباً! هذا نص تجريبي من النموذج المحلي.',
          tokensGenerated: 10,
          inferenceTime: 1000,
        })),
        getModelInfo: jest.fn(() => Promise.resolve(null)),
        getAvailableModels: jest.fn(() => Promise.resolve([])),
        downloadModel: jest.fn(() => Promise.resolve()),
        deleteModel: jest.fn(() => Promise.resolve()),
        getDeviceInfo: jest.fn(() => Promise.resolve({
          totalMemory: 8000,
          availableMemory: 4000,
          cpuCores: 8,
          gpuSupport: true
        }))
      },
    },
    DeviceEventEmitter: {
      addListener: jest.fn(),
      removeListener: jest.fn(),
    },
    NativeEventEmitter: jest.fn(() => ({
      addListener: jest.fn(),
      removeListener: jest.fn(),
    })),
    AppRegistry: {
      registerComponent: jest.fn(),
    },
    StyleSheet: {
      create: (styles) => styles,
    },
    View: 'View',
    Text: 'Text',
    TouchableOpacity: 'TouchableOpacity',
    ScrollView: 'ScrollView',
  };
});

// Mock nodejs-mobile-react-native
jest.mock('nodejs-mobile-react-native', () => ({
  start: jest.fn(),
  channel: {
    send: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
  },
}));

// Mock react-native-fs
jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/mock/documents',
  exists: jest.fn(() => Promise.resolve(true)),
  readDir: jest.fn(() => Promise.resolve([])),
  mkdir: jest.fn(() => Promise.resolve()),
  writeFile: jest.fn(() => Promise.resolve()),
  readFile: jest.fn(() => Promise.resolve('')),
  unlink: jest.fn(() => Promise.resolve()),
  stat: jest.fn(() => Promise.resolve({ size: 1024 })),
  downloadFile: jest.fn(() => ({
    promise: Promise.resolve({ statusCode: 200 }),
  })),
}));

// Mock react-native-device-info
jest.mock('react-native-device-info', () => ({
  getTotalMemory: jest.fn(() => Promise.resolve(8 * 1024 * 1024 * 1024)),
  getFreeDiskStorage: jest.fn(() => Promise.resolve(32 * 1024 * 1024 * 1024)),
  getManufacturer: jest.fn(() => Promise.resolve('Samsung')),
  getModel: jest.fn(() => Promise.resolve('Galaxy S21')),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock react-native-toast-message
jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
  hide: jest.fn(),
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock react-navigation
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }) => children,
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useFocusEffect: jest.fn(),
}));

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: ({ children }) => children,
  }),
}));

// Mock react-native-paper
jest.mock('react-native-paper', () => ({
  Provider: ({ children }) => children,
  DefaultTheme: {
    colors: {
      primary: '#6200ee',
      background: '#ffffff',
      surface: '#ffffff',
      text: '#000000'
    }
  },
  Button: 'Button',
  Card: 'Card',
  Text: 'Text',
  List: {
    Item: 'ListItem',
    Section: 'ListSection'
  }
}));

// Silence the warning: Animated: `useNativeDriver` is not supported
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};