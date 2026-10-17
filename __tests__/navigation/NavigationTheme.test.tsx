import React from 'react';
import { Platform, View } from 'react-native';
import ReactTestRenderer, { act } from 'react-test-renderer';
import AuthNavigator from '../../src/navigation/AuthNavigator';
import MainNavigator from '../../src/navigation/MainNavigator';

jest.mock('react-native-css-interop', () => ({
  createInteropElement: require('react').createElement,
}));
jest.mock('@react-navigation/native', () => ({}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 24, bottom: 24, left: 0, right: 0 }),
}));
jest.mock('react-native-screens', () => {
  const ReactModule = require('react');
  const NativeView = require('react-native').View;
  const InnerScreen = ReactModule.forwardRef((props: object, ref: unknown) =>
    ReactModule.createElement(NativeView, { ...props, ref }),
  );
  const ScreenContext = ReactModule.createContext(InnerScreen);
  const Screen = ReactModule.forwardRef((props: object, ref: unknown) =>
    ReactModule.createElement(ReactModule.useContext(ScreenContext), {
      ...props,
      ref,
    }),
  );
  return { InnerScreen, ScreenContext, Screen };
});
jest.mock('@react-navigation/bottom-tabs', () => {
  const ReactModule = require('react');
  const NativeView = require('react-native').View;
  return {
    createBottomTabNavigator: () => ({
      Navigator: ({ children }: { children: React.ReactNode }) =>
        ReactModule.createElement(NativeView, {}, children),
      Screen: ({
        name,
        component,
        options,
      }: {
        name: string;
        component: React.ComponentType;
        options?: object;
      }) =>
        ReactModule.createElement(
          require('react-native-screens').Screen,
          { testID: `tab-${name}`, activityState: 2, ...options },
          ReactModule.createElement(component),
        ),
    }),
  };
});
jest.mock('@react-navigation/native-stack', () => {
  const ReactModule = require('react');
  const NativeView = require('react-native').View;
  return {
    createNativeStackNavigator: () => ({
      Navigator: (props: object) =>
        ReactModule.createElement(NativeView, {
          ...props,
          testID: 'auth-stack',
        }),
      Screen: () => null,
    }),
  };
});
jest.mock('../../src/screens/auth/LoginScreen', () => () => null);
jest.mock('../../src/screens/auth/RegisterScreen', () => () => null);
jest.mock('../../src/screens/home/HomeScreen', () => () => null);
jest.mock('../../src/screens/profile/ProfileScreen', () => () => null);
jest.mock('../../src/navigation/SubjectsNavigator', () => {
  const ReactModule = require('react');
  return () =>
    ReactModule.createElement(require('react-native-screens').Screen, {
      testID: 'image-preview',
      statusBarStyle: 'light',
    });
});
jest.mock('lucide-react-native', () => {
  const ReactModule = require('react');
  const NativeView = require('react-native').View;
  const Icon = () => ReactModule.createElement(NativeView);
  return new Proxy(
    { __esModule: true },
    { get: (_target, name) => (name === '__esModule' ? true : Icon) },
  );
});

const mounted: ReactTestRenderer.ReactTestRenderer[] = [];
const render = (element: React.ReactElement) => {
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  act(() => {
    renderer = ReactTestRenderer.create(element);
  });
  mounted.push(renderer);
  return renderer;
};
const getNativeView = (
  renderer: ReactTestRenderer.ReactTestRenderer,
  testID: string,
) =>
  renderer.root.findAllByType(View).find(node => node.props.testID === testID)!;

beforeEach(() => {
  jest.replaceProperty(Platform, 'OS', 'android');
});

afterEach(() => {
  act(() => mounted.splice(0).forEach(renderer => renderer.unmount()));
  jest.restoreAllMocks();
});

test('authentication transitions explicitly retain dark icons on the light canvas', () => {
  const renderer = render(<AuthNavigator />);
  expect(
    getNativeView(renderer, 'auth-stack').props.screenOptions.statusBarStyle,
  ).toBe('dark');
});

test('native tab screens receive dark icons without changing their activity state', () => {
  const renderer = render(<MainNavigator />);
  for (const name of ['Home', 'Profile']) {
    expect(getNativeView(renderer, `tab-${name}`).props).toMatchObject({
      statusBarStyle: 'dark',
      activityState: 2,
    });
  }
});

test('a nested dark image preview retains its explicit light icon override', () => {
  const renderer = render(<MainNavigator />);
  expect(getNativeView(renderer, 'tab-Subjects').props.statusBarStyle).toBe(
    'dark',
  );
  expect(getNativeView(renderer, 'image-preview').props.statusBarStyle).toBe(
    'light',
  );
});

test('returning to Subjects opens its list without unmounting the whole tab', () => {
  const renderer = render(<MainNavigator />);
  const subjects = getNativeView(renderer, 'tab-Subjects');
  expect(subjects.props.popToTopOnBlur).toBe(true);
  expect(subjects.props.activityState).toBe(2);
});

test('iOS keeps focused React Native status bar ownership with the existing app configuration', () => {
  jest.replaceProperty(Platform, 'OS', 'ios');
  const auth = render(<AuthNavigator />);
  const main = render(<MainNavigator />);
  expect(
    getNativeView(auth, 'auth-stack').props.screenOptions.statusBarStyle,
  ).toBeUndefined();
  expect(getNativeView(main, 'tab-Home').props.statusBarStyle).toBeUndefined();
  expect(
    getNativeView(main, 'tab-Profile').props.statusBarStyle,
  ).toBeUndefined();
});
