import React from 'react';
import {Alert, Modal} from 'react-native';
import ReactTestRenderer, {act} from 'react-test-renderer';
import AccountMenu from '../../src/components/home/AccountMenu';
import ActionButton from '../../src/components/common/ActionButton';
import {useAuth} from '../../src/hooks/useAuth';

jest.mock('../../src/hooks/useAuth', () => ({useAuth: jest.fn()}));

jest.mock('react-native-css-interop', () => ({
  createInteropElement: require('react').createElement,
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: require('react-native').View,
}));

jest.mock('lucide-react-native', () => {
  const ReactModule = require('react');
  const {View} = require('react-native');
  const Icon = () => ReactModule.createElement(View);

  return new Proxy(
    {__esModule: true},
    {get: (_target, name) => (name === '__esModule' ? true : Icon)},
  );
});

const mockUseAuth = jest.mocked(useAuth);
const logout = jest.fn<Promise<void>, []>();
const mountedMenus: ReactTestRenderer.ReactTestRenderer[] = [];
let alertSpy: jest.SpyInstance<
  ReturnType<typeof Alert.alert>,
  Parameters<typeof Alert.alert>
>;

const renderMenu = () => {
  const onProfile = jest.fn();
  let renderer!: ReactTestRenderer.ReactTestRenderer;

  act(() => {
    renderer = ReactTestRenderer.create(
      <AccountMenu displayName="Alex Student" onProfile={onProfile} />,
    );
  });
  mountedMenus.push(renderer);
  return {renderer, onProfile};
};

const getAvatar = (renderer: ReactTestRenderer.ReactTestRenderer) => {
  const avatar = renderer.root.findAll(
    node =>
      node.props.accessibilityLabel === 'Open account menu' &&
      typeof node.props.onPress === 'function',
  )[0];
  if (!avatar) {
    throw new Error('No account menu button');
  }
  return avatar;
};

const getAction = (
  renderer: ReactTestRenderer.ReactTestRenderer,
  title: string,
) => {
  const action = renderer.root
    .findAllByType(ActionButton)
    .find(node => node.props.title === title);
  if (!action) {
    throw new Error(`No account action titled ${title}`);
  }
  return action;
};

const getConfirmation = () => {
  const confirmation = alertSpy.mock.calls
    .filter(([title]) => title === 'Sign Out')
    .slice(-1)[0];
  if (!confirmation) {
    throw new Error('No sign out confirmation');
  }
  return confirmation;
};

const getConfirmationButton = (title: string) => {
  const button = getConfirmation()[2]?.find(item => item.text === title);
  if (!button?.onPress) {
    throw new Error(`No confirmation action titled ${title}`);
  }
  return button.onPress;
};

const openMenu = (renderer: ReactTestRenderer.ReactTestRenderer) => {
  act(() => getAvatar(renderer).props.onPress());
  expect(renderer.root.findByType(Modal).props.visible).toBe(true);
};

const requestSignOut = (renderer: ReactTestRenderer.ReactTestRenderer) => {
  act(() => getAction(renderer, 'Sign out').props.onPress());
  expect(logout).not.toHaveBeenCalled();
};

beforeEach(() => {
  jest.clearAllMocks();
  logout.mockResolvedValue(undefined);
  alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  mockUseAuth.mockReturnValue({
    user: null,
    loading: false,
    login: jest.fn(),
    register: jest.fn(),
    logout,
  });
});

afterEach(() => {
  act(() => mountedMenus.splice(0).forEach(renderer => renderer.unmount()));
  alertSpy.mockRestore();
});

test('view profile closes the account sheet and invokes the profile callback', () => {
  const {renderer, onProfile} = renderMenu();
  expect(renderer.root.findByType(Modal).props.visible).toBe(false);
  openMenu(renderer);

  act(() => getAction(renderer, 'View profile').props.onPress());

  expect(onProfile).toHaveBeenCalledTimes(1);
  expect(renderer.root.findByType(Modal).props.visible).toBe(false);
  expect(logout).not.toHaveBeenCalled();
});

test('dismissing the account sheet leaves the session intact', () => {
  const {renderer} = renderMenu();
  openMenu(renderer);

  act(() => renderer.root.findByType(Modal).props.onRequestClose());

  expect(renderer.root.findByType(Modal).props.visible).toBe(false);
  expect(alertSpy).not.toHaveBeenCalled();
  expect(logout).not.toHaveBeenCalled();
});

test.each(['Cancel', 'dismiss'])(
  '%s closes the confirmation without signing out and permits another attempt',
  action => {
    const {renderer} = renderMenu();
    openMenu(renderer);
    requestSignOut(renderer);
    expect(renderer.root.findByType(Modal).props.visible).toBe(true);

    act(() => {
      if (action === 'Cancel') {
        getConfirmationButton('Cancel')();
      } else {
        getConfirmation()[3]?.onDismiss?.();
      }
    });

    expect(logout).not.toHaveBeenCalled();
    expect(renderer.root.findByType(Modal).props.visible).toBe(false);
    openMenu(renderer);
    requestSignOut(renderer);
    expect(alertSpy).toHaveBeenCalledTimes(2);
  },
);

test('confirmation and pending sign out prevent repeated prompts and logout requests', async () => {
  let finishLogout!: () => void;
  const request = new Promise<void>(resolve => {
    finishLogout = resolve;
  });
  logout.mockReturnValueOnce(request);
  const {renderer, onProfile} = renderMenu();
  openMenu(renderer);
  const prompt = getAction(renderer, 'Sign out').props.onPress;
  const profile = getAction(renderer, 'View profile').props.onPress;
  act(() => {
    prompt();
    prompt();
    profile();
  });
  expect(alertSpy).toHaveBeenCalledTimes(1);
  expect(onProfile).not.toHaveBeenCalled();
  expect(logout).not.toHaveBeenCalled();

  const confirm = getConfirmationButton('Sign Out');
  act(() => {
    confirm();
    confirm();
    prompt();
    profile();
    getAvatar(renderer).props.onPress();
  });

  expect(logout).toHaveBeenCalledTimes(1);
  expect(alertSpy).toHaveBeenCalledTimes(1);
  expect(renderer.root.findByType(Modal).props.visible).toBe(false);
  expect(getAvatar(renderer).props.disabled).toBe(true);
  expect(onProfile).not.toHaveBeenCalled();

  await act(async () => {
    finishLogout();
    await request;
  });

  expect(getAvatar(renderer).props.disabled).toBe(false);
});

test('a failed sign out explains the failure and allows a successful retry', async () => {
  logout.mockRejectedValueOnce(new Error('Offline'));
  const {renderer} = renderMenu();
  openMenu(renderer);
  requestSignOut(renderer);

  await act(async () => {
    await getConfirmationButton('Sign Out')();
  });

  expect(alertSpy).toHaveBeenLastCalledWith(
    'Sign Out Failed',
    'Unable to sign out. Please try again.',
  );
  expect(getAvatar(renderer).props.disabled).toBe(false);
  expect(renderer.root.findByType(Modal).props.visible).toBe(false);

  openMenu(renderer);
  act(() => getAction(renderer, 'Sign out').props.onPress());
  await act(async () => {
    await getConfirmationButton('Sign Out')();
  });

  expect(logout).toHaveBeenCalledTimes(2);
  expect(getAvatar(renderer).props.disabled).toBe(false);
  expect(renderer.root.findByType(Modal).props.visible).toBe(false);
});

test('a pending sign out cannot show a failure or start again after unmount', async () => {
  let failLogout!: (reason: Error) => void;
  const request = new Promise<void>((_resolve, reject) => {
    failLogout = reject;
  });
  logout.mockReturnValueOnce(request);
  const {renderer} = renderMenu();
  openMenu(renderer);
  requestSignOut(renderer);
  const confirm = getConfirmationButton('Sign Out');
  act(() => {
    confirm();
    renderer.unmount();
  });
  mountedMenus.splice(mountedMenus.indexOf(renderer), 1);

  await act(async () => {
    confirm();
    failLogout(new Error('Offline'));
    await request.catch(() => undefined);
  });

  expect(logout).toHaveBeenCalledTimes(1);
  expect(alertSpy).toHaveBeenCalledTimes(1);
  expect(alertSpy.mock.calls[0][0]).toBe('Sign Out');
});
