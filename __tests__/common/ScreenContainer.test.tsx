import React from 'react';
import { StatusBar, View } from 'react-native';
import ReactTestRenderer, { act } from 'react-test-renderer';
import ScreenContainer from '../../src/components/common/ScreenContainer';

jest.mock('react-native-css-interop', () => ({
  createInteropElement: require('react').createElement,
}));
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: require('react-native').View,
}));
jest.mock('@react-navigation/native', () => ({
  useIsFocused: () => require('react').useContext(mockFocusContext),
}));

const mockFocusContext = React.createContext(false);
const mounted: ReactTestRenderer.ReactTestRenderer[] = [];

const Screens = ({ lightFocused }: { lightFocused: boolean }) => (
  <>
    <mockFocusContext.Provider value={lightFocused}>
      <ScreenContainer>
        <View testID="profile" />
      </ScreenContainer>
    </mockFocusContext.Provider>
    <mockFocusContext.Provider value={!lightFocused}>
      <ScreenContainer tone="dark">
        <View testID="image-preview" />
      </ScreenContainer>
    </mockFocusContext.Provider>
  </>
);

const render = (element: React.ReactElement) => {
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  act(() => {
    renderer = ReactTestRenderer.create(element);
  });
  mounted.push(renderer);
  return renderer;
};

afterEach(() => {
  act(() => mounted.splice(0).forEach(renderer => renderer.unmount()));
});

test('a mounted inactive dark screen does not override an active light screen', () => {
  const renderer = render(<Screens lightFocused />);

  expect(renderer.root.findAllByType(ScreenContainer)).toHaveLength(2);
  const statusBars = renderer.root.findAllByType(StatusBar);
  expect(statusBars).toHaveLength(1);
  expect(statusBars[0].props.barStyle).toBe('dark-content');
});

test('switching focus transfers status bar control and restores contrast when returning', () => {
  const renderer = render(<Screens lightFocused />);

  act(() => renderer.update(<Screens lightFocused={false} />));
  expect(renderer.root.findAllByType(StatusBar)).toHaveLength(1);
  expect(renderer.root.findByType(StatusBar).props.barStyle).toBe(
    'light-content',
  );

  act(() => renderer.update(<Screens lightFocused />));
  expect(renderer.root.findAllByType(StatusBar)).toHaveLength(1);
  expect(renderer.root.findByType(StatusBar).props.barStyle).toBe(
    'dark-content',
  );
});
