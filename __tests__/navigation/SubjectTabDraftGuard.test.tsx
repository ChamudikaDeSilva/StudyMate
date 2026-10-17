import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { useSubjectTabDraftGuard } from '../../src/hooks/useSubjectTabDraftGuard';

let mockBlur: (() => void) | undefined;
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback: () => (() => void) | undefined) => {
    require('react').useEffect(() => {
      mockBlur = callback();
      return mockBlur;
    }, [callback]);
  },
}));

const setOptions = jest.fn();
const listeners = new Set<(event: { preventDefault: () => void }) => void>();
const tabs = {
  setOptions,
  addListener: jest.fn((_name: string, handler: (event: { preventDefault: () => void }) => void) => {
    listeners.add(handler);
    return () => listeners.delete(handler);
  }),
};
const navigation = { getParent: () => tabs } as unknown as Parameters<typeof useSubjectTabDraftGuard>[0];
const Harness = ({ hasDraft }: { hasDraft: boolean }) => {
  useSubjectTabDraftGuard(navigation, hasDraft);
  return null;
};
let renderer: ReactTestRenderer.ReactTestRenderer;
const render = (hasDraft: boolean) => {
  act(() => { renderer = ReactTestRenderer.create(<Harness hasDraft={hasDraft} />); });
};

beforeEach(() => {
  jest.clearAllMocks();
  listeners.clear();
});
afterEach(() => {
  act(() => renderer.unmount());
});

test('an empty material form allows the normal return to the subject list', () => {
  render(false);
  expect(setOptions).toHaveBeenLastCalledWith({ popToTopOnBlur: true });
  const preventDefault = jest.fn();
  act(() => listeners.forEach(listener => listener({ preventDefault })));
  expect(preventDefault).not.toHaveBeenCalled();
});

test('a dirty form stays mounted when leaving its tab and is protected from reselect resets', () => {
  render(true);
  expect(setOptions).toHaveBeenLastCalledWith({ popToTopOnBlur: false });
  const preventDefault = jest.fn();
  act(() => listeners.forEach(listener => listener({ preventDefault })));
  expect(preventDefault).toHaveBeenCalledTimes(1);

  act(() => { mockBlur?.(); });
  expect(listeners.size).toBe(0);
  expect(setOptions).toHaveBeenLastCalledWith({ popToTopOnBlur: false });
});

test('saving or cancelling a draft restores fresh subject-list navigation', () => {
  render(true);
  act(() => renderer.update(<Harness hasDraft={false} />));
  expect(setOptions).toHaveBeenLastCalledWith({ popToTopOnBlur: true });
  const preventDefault = jest.fn();
  act(() => listeners.forEach(listener => listener({ preventDefault })));
  expect(preventDefault).not.toHaveBeenCalled();
  expect(listeners.size).toBe(1);
});

test('leaving the editor permanently removes its reset guard', () => {
  render(true);
  act(() => renderer.update(<></>));
  expect(setOptions).toHaveBeenLastCalledWith({ popToTopOnBlur: true });
  expect(listeners.size).toBe(0);
});
