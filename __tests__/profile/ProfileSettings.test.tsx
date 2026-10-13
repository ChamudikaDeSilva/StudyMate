import React from 'react';
import { Modal, TextInput } from 'react-native';
import ReactTestRenderer, { act } from 'react-test-renderer';
import AppButton from '../../src/components/common/AppButton';
import AppInput from '../../src/components/common/AppInput';
import AccountFormModal from '../../src/components/profile/AccountFormModal';
import ChangePasswordModal from '../../src/components/profile/ChangePasswordModal';
import EditProfileModal from '../../src/components/profile/EditProfileModal';
import ProfileScreen from '../../src/screens/profile/ProfileScreen';
import { useAuth } from '../../src/hooks/useAuth';

jest.mock('../../src/hooks/useAuth', () => ({ useAuth: jest.fn() }));
jest.mock('../../src/hooks/useAppAlert', () => ({
  useAppAlert: () => ({ alert: jest.fn() }),
}));
jest.mock('react-native-css-interop', () => ({
  createInteropElement: require('react').createElement,
}));
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: require('react-native').View,
}));
jest.mock('../../src/components/common/ScreenContainer', () => {
  const ReactModule = require('react');
  return ({ children }: { children: React.ReactNode }) =>
    ReactModule.createElement(require('react-native').View, null, children);
});
jest.mock('lucide-react-native', () => {
  const ReactModule = require('react');
  const Icon = () => ReactModule.createElement(require('react-native').View);
  return new Proxy(
    { __esModule: true },
    { get: (_target, name) => (name === '__esModule' ? true : Icon) },
  );
});

type Renderer = ReactTestRenderer.ReactTestRenderer;
type Editor = 'profile' | 'password';
type ProfileProps = React.ComponentProps<typeof ProfileScreen>;
const mockUseAuth = jest.mocked(useAuth);
const updateProfile = jest.fn<
  Promise<void>,
  [
    React.ComponentProps<typeof EditProfileModal>['onSave'] extends (
      request: infer Request,
    ) => Promise<void>
      ? Request
      : never,
  ]
>();
const changePassword = jest.fn<
  Promise<void>,
  [
    React.ComponentProps<typeof ChangePasswordModal>['onSave'] extends (
      request: infer Request,
    ) => Promise<void>
      ? Request
      : never,
  ]
>();
const onSaved = jest.fn();
const onClose = jest.fn();
const mounted: Renderer[] = [];
const originalUser = {
  id: 1,
  name: 'Alex Student',
  email: 'alex@example.com',
  created_at: '2026-10-12T10:00:00',
  updated_at: '2026-10-12T10:00:00',
};

const profileElement = () => (
  <ProfileScreen
    navigation={
      { navigate: jest.fn() } as unknown as ProfileProps['navigation']
    }
    route={{ key: 'profile', name: 'Profile' }}
  />
);

const render = (element: React.ReactElement) => {
  let renderer!: Renderer;
  act(() => {
    renderer = ReactTestRenderer.create(element);
  });
  mounted.push(renderer);
  return renderer;
};

const renderEditor = (editor: Editor) =>
  render(
    editor === 'profile' ? (
      <EditProfileModal
        initialName={originalUser.name}
        initialEmail={originalUser.email}
        onSave={updateProfile}
        onSaved={onSaved}
        onClose={onClose}
      />
    ) : (
      <ChangePasswordModal
        onSave={changePassword}
        onSaved={onSaved}
        onClose={onClose}
      />
    ),
  );

const getField = (renderer: Renderer, label: string) => {
  const field = renderer.root
    .findAllByType(AppInput)
    .find(input => input.props.label === label);
  if (!field) {
    throw new Error(`No profile field labelled ${label}`);
  }
  return field;
};

const getInput = (renderer: Renderer, label: string) =>
  getField(renderer, label).findByType(TextInput);

const fill = (renderer: Renderer, values: Record<string, string>) => {
  act(() => {
    Object.entries(values).forEach(([label, value]) =>
      getInput(renderer, label).props.onChangeText(value),
    );
  });
};

const button = (renderer: Renderer, title: string) => {
  const found = renderer.root
    .findAllByType(AppButton)
    .find(control => control.props.title === title);
  if (!found) {
    throw new Error(`No profile button titled ${title}`);
  }
  return found;
};

const save = async (renderer: Renderer) => {
  await act(async () => {
    await renderer.root.findByType(AccountFormModal).props.onSave();
  });
};

const visibleText = (renderer: Renderer) => {
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

const validPasswords = {
  'Current password': '  old password  ',
  'New password': '  new password  ',
  'Confirm new password': '  new password  ',
};

beforeEach(() => {
  jest.clearAllMocks();
  updateProfile.mockResolvedValue(undefined);
  changePassword.mockResolvedValue(undefined);
  mockUseAuth.mockReturnValue({
    user: originalUser,
    loading: false,
    sessionValidated: true,
    getSyncSession: jest.fn(),
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    updateProfile,
    changePassword,
  });
});

afterEach(() => {
  act(() => mounted.splice(0).forEach(renderer => renderer.unmount()));
});

test('name edits trim values and equivalent emails need no password', async () => {
  const renderer = renderEditor('profile');
  fill(renderer, {
    'Full name': '  Taylor Student  ',
    'Email address': '  ALEX@Example.COM  ',
  });
  expect(
    renderer.root.findAllByType(AppInput).map(input => input.props.label),
  ).not.toContain('Current password');

  await save(renderer);

  expect(updateProfile).toHaveBeenCalledWith({
    name: 'Taylor Student',
    email: 'alex@example.com',
  });
  expect(onSaved).toHaveBeenCalledWith(false);
});

test('changing email requires the current password and explains the new sign-in address', async () => {
  const renderer = renderEditor('profile');
  fill(renderer, { 'Email address': '  NEW@Example.COM  ' });

  expect(visibleText(renderer)).toContain('Your sign-in address will change');
  await save(renderer);
  expect(updateProfile).not.toHaveBeenCalled();
  expect(getField(renderer, 'Current password').props.error).toBeTruthy();

  fill(renderer, { 'Current password': '  keep spaces  ' });
  await save(renderer);

  expect(updateProfile).toHaveBeenCalledWith({
    name: originalUser.name,
    email: 'new@example.com',
    current_password: '  keep spaces  ',
  });
  expect(onSaved).toHaveBeenCalledWith(true);
});

test('restoring the original email hides reauthentication and omits its password', async () => {
  const renderer = renderEditor('profile');
  fill(renderer, { 'Email address': 'new@example.com' });
  fill(renderer, { 'Current password': 'hidden password' });
  fill(renderer, { 'Email address': originalUser.email });

  await save(renderer);

  expect(updateProfile).toHaveBeenCalledWith({
    name: originalUser.name,
    email: originalUser.email,
  });
});

test.each([
  ['Full name', ' '],
  ['Full name', 'A'],
  ['Full name', 'A'.repeat(101)],
  ['Email address', 'wrong-address'],
])('invalid profile %s stays inline without saving', async (label, value) => {
  const renderer = renderEditor('profile');
  fill(renderer, { [label]: value });

  await save(renderer);

  expect(getField(renderer, label).props.error).toBeTruthy();
  expect(updateProfile).not.toHaveBeenCalled();
  expect(onSaved).not.toHaveBeenCalled();
});

test.each([
  ['Current password', ''],
  ['Current password', 'A'.repeat(129)],
  ['New password', 'short'],
  ['New password', 'A'.repeat(129)],
  ['New password', validPasswords['Current password']],
  ['Confirm new password', 'different password'],
])('invalid %s cannot change the password', async (label, value) => {
  const renderer = renderEditor('password');
  fill(renderer, { ...validPasswords, [label]: value });

  await save(renderer);

  expect(getField(renderer, label).props.error).toBeTruthy();
  expect(changePassword).not.toHaveBeenCalled();
  expect(onSaved).not.toHaveBeenCalled();
});

test('password changes preserve spaces and never submit the confirmation', async () => {
  const renderer = renderEditor('password');
  fill(renderer, validPasswords);

  await save(renderer);

  expect(changePassword).toHaveBeenCalledWith({
    current_password: validPasswords['Current password'],
    new_password: validPasswords['New password'],
  });
  expect(onSaved).toHaveBeenCalledTimes(1);
});

test('email changes reject an oversized current password before calling the API', async () => {
  const renderer = renderEditor('profile');
  fill(renderer, { 'Email address': 'new@example.com' });
  fill(renderer, { 'Current password': 'A'.repeat(129) });
  await save(renderer);
  expect(getField(renderer, 'Current password').props.error).toBeTruthy();
  expect(updateProfile).not.toHaveBeenCalled();
});

test.each<Editor>(['profile', 'password'])(
  '%s errors remain inline and allow a corrected retry',
  async editor => {
    const request = editor === 'profile' ? updateProfile : changePassword;
    request.mockRejectedValueOnce(new Error('Current password is incorrect.'));
    const renderer = renderEditor(editor);
    fill(
      renderer,
      editor === 'profile'
        ? { 'Email address': 'new@example.com' }
        : validPasswords,
    );
    if (editor === 'profile') {
      fill(renderer, { 'Current password': 'old password' });
    }

    await save(renderer);
    expect(visibleText(renderer)).toContain('Current password is incorrect.');
    expect(onSaved).not.toHaveBeenCalled();

    fill(renderer, { 'Current password': 'corrected password' });
    expect(visibleText(renderer)).not.toContain(
      'Current password is incorrect.',
    );
    await save(renderer);
    expect(request).toHaveBeenCalledTimes(2);
    expect(onSaved).toHaveBeenCalledTimes(1);
  },
);

test.each<Editor>(['profile', 'password'])(
  '%s blocks duplicate submissions and every dismissal while pending',
  async editor => {
    let resolve!: () => void;
    const pending = new Promise<void>(finish => {
      resolve = finish;
    });
    const request = editor === 'profile' ? updateProfile : changePassword;
    request.mockReturnValueOnce(pending);
    const renderer = renderEditor(editor);
    if (editor === 'password') {
      fill(renderer, validPasswords);
    }
    const modal = renderer.root.findByType(AccountFormModal);
    const staleClose = modal.props.onClose;
    const keyboardSubmit = getInput(
      renderer,
      editor === 'profile' ? 'Email address' : 'Confirm new password',
    ).props.onSubmitEditing;

    act(() => {
      modal.props.onSave();
      staleClose();
      keyboardSubmit();
      modal.props.onSave();
    });
    expect(request).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
    expect(button(renderer, 'Cancel').props.disabled).toBe(true);
    expect(
      renderer.root
        .findAllByType(AppInput)
        .every(input => !input.props.editable),
    ).toBe(true);
    act(() => {
      button(renderer, 'Cancel').props.onPress();
      renderer.root.findByType(Modal).props.onRequestClose();
      renderer.root.findByType(AccountFormModal).props.onClose();
    });
    expect(onClose).not.toHaveBeenCalled();

    await act(async () => {
      resolve();
      await pending;
    });
    expect(onSaved).toHaveBeenCalledTimes(1);
    act(() => staleClose());
    expect(onClose).toHaveBeenCalledTimes(1);
  },
);

test('closing and reopening profile editing restores current account values', () => {
  const renderer = render(profileElement());
  act(() => button(renderer, 'Edit profile').props.onPress());
  fill(renderer, {
    'Full name': 'Unsaved name',
    'Email address': 'new@example.com',
  });
  fill(renderer, { 'Current password': 'unsaved password' });
  act(() => button(renderer, 'Cancel').props.onPress());
  expect(renderer.root.findAllByType(EditProfileModal)).toHaveLength(0);
  expect(updateProfile).not.toHaveBeenCalled();

  act(() => button(renderer, 'Edit profile').props.onPress());
  expect(getInput(renderer, 'Full name').props.value).toBe(originalUser.name);
  expect(getInput(renderer, 'Email address').props.value).toBe(
    originalUser.email,
  );
  fill(renderer, { 'Email address': 'new@example.com' });
  expect(getInput(renderer, 'Current password').props.value).toBe('');
});

test('successful profile save reflects context updates and reopens with the saved details', async () => {
  const renderer = render(profileElement());
  const updatedUser = {
    ...originalUser,
    name: 'Taylor Student',
    email: 'new@example.com',
  };
  updateProfile.mockImplementationOnce(async () => {
    mockUseAuth.mockReturnValue({
      ...mockUseAuth(),
      user: updatedUser,
    });
    renderer.update(profileElement());
  });
  act(() => button(renderer, 'Edit profile').props.onPress());
  fill(renderer, {
    'Full name': updatedUser.name,
    'Email address': updatedUser.email,
  });
  fill(renderer, { 'Current password': 'current password' });

  await save(renderer);

  expect(renderer.root.findAllByType(EditProfileModal)).toHaveLength(0);
  expect(visibleText(renderer)).toContain(updatedUser.name);
  expect(visibleText(renderer)).toContain(updatedUser.email);
  expect(visibleText(renderer)).toContain(
    'Use your new email address next time you sign in.',
  );
  act(() => button(renderer, 'Edit profile').props.onPress());
  expect(getInput(renderer, 'Full name').props.value).toBe(updatedUser.name);
  expect(getInput(renderer, 'Email address').props.value).toBe(
    updatedUser.email,
  );
});

test('successful password changes close the modal and reopen with empty passwords', async () => {
  const renderer = render(profileElement());
  act(() => button(renderer, 'Change password').props.onPress());
  fill(renderer, validPasswords);

  await save(renderer);

  expect(renderer.root.findAllByType(ChangePasswordModal)).toHaveLength(0);
  expect(visibleText(renderer)).toContain(
    'Password updated. You’re still signed in here.',
  );
  act(() => button(renderer, 'Change password').props.onPress());
  Object.keys(validPasswords).forEach(label => {
    expect(getInput(renderer, label).props.value).toBe('');
  });
});

test('an unmounted editor ignores a late save response', async () => {
  let resolve!: () => void;
  const pending = new Promise<void>(finish => {
    resolve = finish;
  });
  updateProfile.mockReturnValueOnce(pending);
  const renderer = renderEditor('profile');
  let pendingSave!: Promise<void>;
  act(() => {
    pendingSave = renderer.root.findByType(AccountFormModal).props.onSave();
  });
  act(() => renderer.unmount());
  mounted.splice(mounted.indexOf(renderer), 1);

  await act(async () => {
    resolve();
    await pending;
    await pendingSave;
  });

  expect(onSaved).not.toHaveBeenCalled();
});
