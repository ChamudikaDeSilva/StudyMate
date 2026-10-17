import React from 'react';
import { Modal, Platform } from 'react-native';
import ReactTestRenderer, { act } from 'react-test-renderer';
import AccountMenu from '../../src/components/home/AccountMenu';
import ActionButton from '../../src/components/common/ActionButton';
import AppDialog from '../../src/components/common/AppDialog';
import AppModal from '../../src/components/common/AppModal';
import { AppAlertProvider } from '../../src/context/AppAlertContext';
import { useAuth } from '../../src/hooks/useAuth';

jest.mock('../../src/hooks/useAuth', () => ({ useAuth: jest.fn() }));
const mockBlur = new Set<() => void>();
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback: () => (() => void) | undefined) => {
    require('react').useEffect(() => {
      const cleanup = callback();
      if (cleanup) {
        mockBlur.add(cleanup);
      }
      return () => {
        if (cleanup) {
          mockBlur.delete(cleanup);
          cleanup();
        }
      };
    }, [callback]);
  },
}));
jest.mock('react-native-css-interop', () => ({
  createInteropElement: require('react').createElement,
}));
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: require('react-native').View,
}));
jest.mock('lucide-react-native', () => {
  const Icon = () =>
    require('react').createElement(require('react-native').View);
  return new Proxy(
    { __esModule: true },
    { get: (_target, name) => (name === '__esModule' ? true : Icon) },
  );
});

const logout = jest.fn<Promise<void>, []>();
const mounted: ReactTestRenderer.ReactTestRenderer[] = [];
let platform = 'ios';
const initialPlatform = Object.getOwnPropertyDescriptor(Platform, 'OS')!;
const renderMenu = () => {
  const onProfile = jest.fn();
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  act(() => {
    renderer = ReactTestRenderer.create(
      <AppAlertProvider>
        <AccountMenu displayName="Alex Student" onProfile={onProfile} />
      </AppAlertProvider>,
    );
  });
  mounted.push(renderer);
  return { renderer, onProfile };
};
const avatar = (renderer: ReactTestRenderer.ReactTestRenderer) =>
  renderer.root.find(
    node =>
      node.props.accessibilityLabel === 'Open account menu' &&
      typeof node.props.onPress === 'function',
  );
const sheet = (renderer: ReactTestRenderer.ReactTestRenderer) =>
  renderer.root.findByType(AppModal);
const rootModal = (renderer: ReactTestRenderer.ReactTestRenderer) =>
  renderer.root
    .findAllByType(Modal)
    .find(node => node.props.testID === 'app-dialog-modal')!;
const action = (renderer: ReactTestRenderer.ReactTestRenderer, title: string) =>
  sheet(renderer)
    .findAllByType(ActionButton)
    .find(node => node.props.title === title)!;
const dialog = (renderer: ReactTestRenderer.ReactTestRenderer) =>
  renderer.root.findByType(AppDialog);
const dialogAction = (
  renderer: ReactTestRenderer.ReactTestRenderer,
  title: string,
) => {
  const popup = dialog(renderer);
  const index = popup.props.buttons.findIndex(
    (button: { text: string }) => button.text === title,
  );
  if (index < 0) {
    throw new Error('Missing dialog action ' + title);
  }
  const onSelect = popup.props.onSelect;
  return () => onSelect(index);
};
const open = (renderer: ReactTestRenderer.ReactTestRenderer) => {
  act(() => avatar(renderer).props.onPress());
  expect(sheet(renderer).props.visible).toBe(true);
};

test('leaving the screen closes its account sheet before another tab is shown', () => {
  const { renderer } = renderMenu();
  open(renderer);
  act(() => mockBlur.forEach(cleanup => cleanup()));
  expect(sheet(renderer).props.visible).toBe(false);
});
const requestLogout = (renderer: ReactTestRenderer.ReactTestRenderer) => {
  const previousCalls = logout.mock.calls.length;
  act(() => action(renderer, 'Sign out').props.onPress());
  expect(sheet(renderer).props.visible).toBe(false);
  expect(sheet(renderer).findByType(Modal).props.visible).toBe(false);
  if (platform === 'ios') {
    expect(rootModal(renderer).props.visible).toBe(false);
    expect(renderer.root.findAllByType(AppDialog)).toHaveLength(0);
    completeSheetDismissal(renderer);
  }
  expect(rootModal(renderer).props.visible).toBe(true);
  expect(dialog(renderer).props.title).toBe('Sign out?');
  expect(logout).toHaveBeenCalledTimes(previousCalls);
};
const completeSheetDismissal = (
  renderer: ReactTestRenderer.ReactTestRenderer,
) => {
  act(() => sheet(renderer).findByType(Modal).props.onDismiss?.());
};
const completeRootDismissal = (
  renderer: ReactTestRenderer.ReactTestRenderer,
) => {
  act(() => rootModal(renderer).props.onDismiss());
};

beforeEach(() => {
  platform = 'ios';
  Object.defineProperty(Platform, 'OS', {
    configurable: true,
    get: () => platform,
  });
  jest.clearAllMocks();
  logout.mockResolvedValue(undefined);
  jest.mocked(useAuth).mockReturnValue({
    user: null,
    loading: false,
    sessionValidated: true,
    getSyncSession: jest.fn(),
    login: jest.fn(),
    register: jest.fn(),
    logout,
    updateProfile: jest.fn(),
    changePassword: jest.fn(),
  });
});
afterEach(() => {
  act(() => mounted.splice(0).forEach(renderer => renderer.unmount()));
  Object.defineProperty(Platform, 'OS', initialPlatform);
});

test('view profile closes the shared account sheet and navigates once', () => {
  const { renderer, onProfile } = renderMenu();
  open(renderer);
  act(() => action(renderer, 'View profile').props.onPress());
  expect(onProfile).toHaveBeenCalledTimes(1);
  expect(sheet(renderer).props.visible).toBe(false);
  expect(logout).not.toHaveBeenCalled();
});

test('closing the account sheet leaves the session intact', () => {
  const { renderer } = renderMenu();
  open(renderer);
  act(() => sheet(renderer).findByType(Modal).props.onRequestClose());
  expect(sheet(renderer).props.visible).toBe(false);
  expect(renderer.root.findAllByType(AppDialog)).toHaveLength(0);
  expect(logout).not.toHaveBeenCalled();
});

test.each(['ios', 'android'])(
  'sign-out confirmation replaces the account sheet on %s',
  os => {
    platform = os;
    const { renderer } = renderMenu();
    open(renderer);
    requestLogout(renderer);
    expect(sheet(renderer).findAllByType(AppDialog)).toHaveLength(0);
    expect(rootModal(renderer).findAllByType(AppDialog)).toHaveLength(1);
    act(() => dialogAction(renderer, 'Cancel')());
    expect(logout).not.toHaveBeenCalled();
    expect(sheet(renderer).props.visible).toBe(false);
  },
);

test.each(['Cancel', 'backdrop', 'back'])(
  '%s dismisses the themed confirmation and allows another attempt',
  mode => {
    const { renderer } = renderMenu();
    open(renderer);
    requestLogout(renderer);
    act(() => {
      if (mode === 'Cancel') {
        dialogAction(renderer, 'Cancel')();
      } else if (mode === 'backdrop') {
        dialog(renderer).props.onDismiss();
      } else {
        rootModal(renderer).props.onRequestClose();
      }
    });
    expect(logout).not.toHaveBeenCalled();
    expect(sheet(renderer).props.visible).toBe(false);
    expect(rootModal(renderer).props.visible).toBe(false);
    completeRootDismissal(renderer);
    open(renderer);
    requestLogout(renderer);
  },
);

test('confirmation and pending logout block repeated actions', async () => {
  let finish!: () => void;
  const pending = new Promise<void>(resolve => {
    finish = resolve;
  });
  logout.mockReturnValueOnce(pending);
  const { renderer, onProfile } = renderMenu();
  open(renderer);
  const request = action(renderer, 'Sign out').props.onPress;
  const profile = action(renderer, 'View profile').props.onPress;
  act(() => {
    request();
    request();
    profile();
  });
  expect(sheet(renderer).props.visible).toBe(false);
  expect(renderer.root.findAllByType(AppDialog)).toHaveLength(0);
  completeSheetDismissal(renderer);
  expect(renderer.root.findAllByType(AppDialog)).toHaveLength(1);
  expect(onProfile).not.toHaveBeenCalled();
  const confirm = dialogAction(renderer, 'Sign out');
  act(() => {
    confirm();
    confirm();
    request();
    profile();
    avatar(renderer).props.onPress();
  });
  expect(logout).toHaveBeenCalledTimes(1);
  expect(sheet(renderer).props.visible).toBe(false);
  expect(avatar(renderer).props.disabled).toBe(true);
  expect(onProfile).not.toHaveBeenCalled();
  await act(async () => {
    finish();
    await pending;
  });
  expect(avatar(renderer).props.disabled).toBe(false);
});

test('failed logout shows a themed error and permits a retry', async () => {
  logout.mockRejectedValueOnce(new Error('Offline'));
  const { renderer } = renderMenu();
  open(renderer);
  requestLogout(renderer);
  await act(async () => {
    dialogAction(renderer, 'Sign out')();
  });
  expect(rootModal(renderer).props.visible).toBe(false);
  completeRootDismissal(renderer);
  expect(dialog(renderer).props.title).toBe('Sign out failed');
  expect(dialog(renderer).props.options.tone).toBe('danger');
  act(() => dialogAction(renderer, 'OK')());
  // Complete the root native dialog dismissal before opening the next sheet.
  completeRootDismissal(renderer);
  open(renderer);
  requestLogout(renderer);
  await act(async () => {
    dialogAction(renderer, 'Sign out')();
  });
  expect(logout).toHaveBeenCalledTimes(2);
  expect(avatar(renderer).props.disabled).toBe(false);
});

test('a late failed logout cannot show another popup after unmount', async () => {
  let fail!: (reason: Error) => void;
  const pending = new Promise<void>((_resolve, reject) => {
    fail = reject;
  });
  logout.mockReturnValueOnce(pending);
  const { renderer } = renderMenu();
  open(renderer);
  requestLogout(renderer);
  const confirm = dialogAction(renderer, 'Sign out');
  act(() => {
    confirm();
    renderer.unmount();
  });
  mounted.splice(mounted.indexOf(renderer), 1);
  await act(async () => {
    confirm();
    fail(new Error('Offline'));
    await pending.catch(() => undefined);
  });
  expect(logout).toHaveBeenCalledTimes(1);
});
