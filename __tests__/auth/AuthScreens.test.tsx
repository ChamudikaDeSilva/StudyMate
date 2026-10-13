import React from 'react';
import {TextInput} from 'react-native';
import ReactTestRenderer, {act} from 'react-test-renderer';
import LoginScreen from '../../src/screens/auth/LoginScreen';
import RegisterScreen from '../../src/screens/auth/RegisterScreen';
import AppButton from '../../src/components/common/AppButton';
import AppInput from '../../src/components/common/AppInput';
import {useAuth} from '../../src/hooks/useAuth';

jest.mock('../../src/hooks/useAuth', () => ({useAuth: jest.fn()}));

// Keep NativeWind's JSX transform while testing interactions without native styles.
jest.mock('react-native-css-interop', () => ({
  createInteropElement: require('react').createElement,
}));

jest.mock('../../src/components/auth/AuthScreenLayout', () => {
  const ReactModule = require('react');
  const {View} = require('react-native');

  return ({children}: {children: React.ReactNode}) =>
    ReactModule.createElement(View, null, children);
});

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
const login = jest.fn<Promise<void>, [string, string]>();
const register = jest.fn<Promise<void>, [string, string, string]>();
const mountedScreens: ReactTestRenderer.ReactTestRenderer[] = [];

type LoginProps = React.ComponentProps<typeof LoginScreen>;
type RegisterProps = React.ComponentProps<typeof RegisterScreen>;
type Screen = 'login' | 'register';

const validLogin = {
  'Email address': '  STUDENT@Example.COM  ',
  Password: '  keep spaces  ',
};
const validRegistration = {
  'Full name': '  Alex Student  ',
  ...validLogin,
  'Confirm password': validLogin.Password,
};

const makeNavigation = (canGoBack = false) => ({
  navigate: jest.fn(),
  goBack: jest.fn(),
  canGoBack: jest.fn(() => canGoBack),
});

const renderScreen = (screen: Screen, navigation = makeNavigation()) => {
  let renderer!: ReactTestRenderer.ReactTestRenderer;

  act(() => {
    renderer = ReactTestRenderer.create(
      screen === 'login' ? (
        <LoginScreen
          navigation={navigation as unknown as LoginProps['navigation']}
          route={{key: 'login', name: 'Login'}}
        />
      ) : (
        <RegisterScreen
          navigation={navigation as unknown as RegisterProps['navigation']}
          route={{key: 'register', name: 'Register'}}
        />
      ),
    );
  });

  mountedScreens.push(renderer);
  return renderer;
};

const getField = (renderer: ReactTestRenderer.ReactTestRenderer, label: string) => {
  const field = renderer.root
    .findAllByType(AppInput)
    .find(input => input.props.label.toLowerCase() === label.toLowerCase());

  if (!field) {
    throw new Error(`No authentication field labelled ${label}`);
  }
  return field;
};

const getInput = (renderer: ReactTestRenderer.ReactTestRenderer, label: string) =>
  getField(renderer, label).findByType(TextInput);

const fillFields = (
  renderer: ReactTestRenderer.ReactTestRenderer,
  values: Record<string, string>,
) => {
  act(() => {
    Object.entries(values).forEach(([label, value]) =>
      getInput(renderer, label).props.onChangeText(value),
    );
  });
};

const getSubmit = (renderer: ReactTestRenderer.ReactTestRenderer) =>
  renderer.root.findByType(AppButton).props.onPress as () => void;

const getControl = (
  renderer: ReactTestRenderer.ReactTestRenderer,
  accessibilityLabel: string,
) =>
  renderer.root.find(
    node =>
      node.props.accessibilityLabel === accessibilityLabel &&
      typeof node.props.onPress === 'function',
  );

const visibleText = (renderer: ReactTestRenderer.ReactTestRenderer) => {
  const text: string[] = [];
  const collect = (node: unknown): void => {
    if (typeof node === 'string') {
      text.push(node);
    } else if (Array.isArray(node)) {
      node.forEach(collect);
    } else if (node && typeof node === 'object' && 'children' in node) {
      collect(node.children);
    }
  };
  collect(renderer.toJSON());
  return text.join(' ');
};

beforeEach(() => {
  jest.clearAllMocks();
  login.mockResolvedValue(undefined);
  register.mockResolvedValue(undefined);
  mockUseAuth.mockReturnValue({
    user: null,
    loading: false,
    sessionValidated: true,
    getSyncSession: jest.fn(),
    login,
    register,
    logout: jest.fn(),
    updateProfile: jest.fn(),
    changePassword: jest.fn(),
  });
});

afterEach(() => {
  act(() => mountedScreens.splice(0).forEach(renderer => renderer.unmount()));
});

test.each<[Screen, string, string]>([
  ['login', 'Email address', ''],
  ['login', 'Email address', 'invalid-email'],
  ['login', 'Password', ''],
  ['register', 'Full name', 'A'],
  ['register', 'Email address', 'invalid-email'],
  ['register', 'Password', 'short'],
  ['register', 'Confirm password', 'a different password'],
])('%s displays an inline error for invalid %s', async (screen, label, invalidValue) => {
  const renderer = renderScreen(screen);
  fillFields(renderer, {
    ...(screen === 'login' ? validLogin : validRegistration),
    [label]: invalidValue,
  });

  await act(async () => {
    await getSubmit(renderer)();
  });

  const error = getField(renderer, label).props.error;
  expect(error).toEqual(expect.any(String));
  expect(error.length).toBeGreaterThan(0);
  expect(visibleText(renderer)).toContain(error);
  expect(login).not.toHaveBeenCalled();
  expect(register).not.toHaveBeenCalled();
});

test('login normalizes email and preserves the entered password', async () => {
  const renderer = renderScreen('login');
  fillFields(renderer, validLogin);

  await act(async () => {
    await getSubmit(renderer)();
  });

  expect(login).toHaveBeenCalledWith('student@example.com', validLogin.Password);
  expect(login).toHaveBeenCalledTimes(1);
});

test('signup trims name and normalizes email while preserving the password', async () => {
  const renderer = renderScreen('register');
  fillFields(renderer, validRegistration);

  await act(async () => {
    await getSubmit(renderer)();
  });

  expect(register).toHaveBeenCalledWith(
    'Alex Student',
    'student@example.com',
    validRegistration.Password,
  );
  expect(register).toHaveBeenCalledTimes(1);
});

test.each<Screen>(['login', 'register'])(
  '%s displays the backend error inline and allows correction',
  async screen => {
    const backendError = 'Unable to sign in with these details.';
    const authenticate = screen === 'login' ? login : register;
    authenticate.mockRejectedValueOnce(new Error(backendError));
    const renderer = renderScreen(screen);
    fillFields(renderer, screen === 'login' ? validLogin : validRegistration);

    await act(async () => {
      await getSubmit(renderer)();
    });

    expect(visibleText(renderer)).toContain(backendError);
    expect(
      renderer.root.findAll(node => node.props.accessibilityRole === 'alert').length,
    ).toBeGreaterThan(0);
    expect(getInput(renderer, 'Email address').props.editable).toBe(true);
    expect(renderer.root.findByType(AppButton).props.loading).toBe(false);

    fillFields(renderer, {'Email address': 'corrected@example.com'});
    expect(visibleText(renderer)).not.toContain(backendError);
  },
);

test.each<Screen>(['login', 'register'])(
  '%s prevents duplicate button and keyboard submissions while pending',
  async screen => {
    let resolveRequest!: () => void;
    const request = new Promise<void>(resolve => {
      resolveRequest = resolve;
    });
    const authenticate = screen === 'login' ? login : register;
    authenticate.mockReturnValueOnce(request);
    const renderer = renderScreen(screen);
    fillFields(renderer, screen === 'login' ? validLogin : validRegistration);
    const submit = getSubmit(renderer);
    const keyboardSubmit = getInput(
      renderer,
      screen === 'login' ? 'Password' : 'Confirm password',
    ).props.onSubmitEditing;

    act(() => {
      submit();
      submit();
      keyboardSubmit();
    });

    expect(authenticate).toHaveBeenCalledTimes(1);
    expect(getInput(renderer, 'Email address').props.editable).toBe(false);
    expect(renderer.root.findByType(AppButton).props.loading).toBe(true);
    const blockedControls = [
      'Show password',
      ...(screen === 'register' ? ['Show confirmation password'] : []),
      screen === 'login' ? 'Create account' : 'Sign in',
    ];
    blockedControls.forEach(label => {
      expect(getControl(renderer, label).props.disabled).toBe(true);
    });

    await act(async () => {
      resolveRequest();
      await request;
    });

    expect(getInput(renderer, 'Email address').props.editable).toBe(true);
    expect(renderer.root.findByType(AppButton).props.loading).toBe(false);
    blockedControls.forEach(label => {
      expect(getControl(renderer, label).props.disabled).toBe(false);
    });
  },
);

test('the login password toggle keeps the entered password intact', () => {
  const renderer = renderScreen('login');
  fillFields(renderer, {Password: validLogin.Password});
  expect(getInput(renderer, 'Password').props.secureTextEntry).toBe(true);
  const toggle = getControl(renderer, 'Show password');

  act(() => toggle.props.onPress());

  expect(getInput(renderer, 'Password').props.secureTextEntry).toBe(false);
  expect(getInput(renderer, 'Password').props.value).toBe(validLogin.Password);
});

test('signup password and confirmation visibility are independent and preserve both values', () => {
  const renderer = renderScreen('register');
  const values = {
    Password: 'My first password',
    'Confirm password': 'A different confirmation',
  };
  fillFields(renderer, values);

  expect(getInput(renderer, 'Password').props.secureTextEntry).toBe(true);
  expect(getInput(renderer, 'Confirm password').props.secureTextEntry).toBe(true);
  act(() => getControl(renderer, 'Show password').props.onPress());
  expect(getInput(renderer, 'Password').props.secureTextEntry).toBe(false);
  expect(getInput(renderer, 'Confirm password').props.secureTextEntry).toBe(true);

  act(() => getControl(renderer, 'Show confirmation password').props.onPress());
  act(() => getControl(renderer, 'Hide password').props.onPress());
  expect(getInput(renderer, 'Password').props.secureTextEntry).toBe(true);
  expect(getInput(renderer, 'Confirm password').props.secureTextEntry).toBe(false);
  Object.entries(values).forEach(([label, value]) => {
    expect(getInput(renderer, label).props.value).toBe(value);
  });
});

test('the login footer opens signup', () => {
  const navigation = makeNavigation();
  const renderer = renderScreen('login', navigation);

  act(() => getControl(renderer, 'Create account').props.onPress());

  expect(navigation.navigate).toHaveBeenCalledWith('Register');
  expect(navigation.goBack).not.toHaveBeenCalled();
});

test.each([true, false])(
  'the signup footer returns to login when canGoBack is %s',
  canGoBack => {
    const navigation = makeNavigation(canGoBack);
    const renderer = renderScreen('register', navigation);

    act(() => getControl(renderer, 'Sign in').props.onPress());

    if (canGoBack) {
      expect(navigation.goBack).toHaveBeenCalledTimes(1);
      expect(navigation.navigate).not.toHaveBeenCalled();
    } else {
      expect(navigation.navigate).toHaveBeenCalledWith('Login');
      expect(navigation.goBack).not.toHaveBeenCalled();
    }
  },
);
