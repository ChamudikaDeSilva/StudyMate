import React, { useContext } from 'react';
import { Modal, Platform, View } from 'react-native';
import ReactTestRenderer, { act } from 'react-test-renderer';
import {
  AppAlert,
  AppAlertContext,
  AppAlertProvider,
} from '../../src/context/AppAlertContext';
import AppDialog from '../../src/components/common/AppDialog';
import AppModal from '../../src/components/common/AppModal';
import ActionButton from '../../src/components/common/ActionButton';
import useAppAlert from '../../src/hooks/useAppAlert';

jest.mock('react-native-css-interop', () => ({
  createInteropElement: require('react').createElement,
}));
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: require('react-native').View,
}));
jest.mock('lucide-react-native', () => {
  const ReactModule = require('react');
  const { View: NativeView } = require('react-native');
  const Icon = () => ReactModule.createElement(NativeView);
  return new Proxy(
    { __esModule: true },
    { get: (_target, name) => (name === '__esModule' ? true : Icon) },
  );
});

let platform = 'ios';
const initialPlatform = Object.getOwnPropertyDescriptor(Platform, 'OS')!;
let alert!: AppAlert;
let otherAlert!: AppAlert;
let currentDialogId: number | undefined;
const mounted: ReactTestRenderer.ReactTestRenderer[] = [];

const Owner = ({ other = false }: { other?: boolean }) => {
  const handle = useAppAlert().alert;
  if (other) {
    otherAlert = handle;
  } else {
    alert = handle;
  }
  return null;
};
const Observer = () => {
  currentDialogId = useContext(AppAlertContext)?.active?.id;
  return null;
};

interface HarnessProps {
  owner?: boolean;
  host?: boolean;
  secondHost?: boolean;
  onClose?: () => void;
  onDismiss?: () => void;
}
const Harness = ({
  owner = true,
  host = false,
  secondHost = false,
  onClose,
  onDismiss,
}: HarnessProps) => (
  <AppAlertProvider>
    {owner && <Owner />}
    <Owner other />
    <Observer />
    <AppModal
      testID="first-host"
      visible={host}
      transparent
      onRequestClose={onClose}
      onDismiss={onDismiss}
    >
      <View testID="form-content" />
    </AppModal>
    <AppModal testID="second-host" visible={secondHost} transparent>
      <View />
    </AppModal>
  </AppAlertProvider>
);

const render = (element: React.ReactElement = <Harness />) => {
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  act(() => {
    renderer = ReactTestRenderer.create(element);
  });
  mounted.push(renderer);
  return renderer;
};
const rootModal = (renderer: ReactTestRenderer.ReactTestRenderer) =>
  renderer.root
    .findAllByType(Modal)
    .find(node => node.props.testID === 'app-dialog-modal')!;
const hostModal = (
  renderer: ReactTestRenderer.ReactTestRenderer,
  id = 'first-host',
) => renderer.root.findAllByType(Modal).find(node => node.props.testID === id)!;
const dialog = (renderer: ReactTestRenderer.ReactTestRenderer) =>
  renderer.root.findByType(AppDialog);
const finishRootDismiss = (renderer: ReactTestRenderer.ReactTestRenderer) =>
  act(() => rootModal(renderer).props.onDismiss());

beforeEach(() => {
  platform = 'ios';
  Object.defineProperty(Platform, 'OS', {
    configurable: true,
    get: () => platform,
  });
});
afterEach(() => {
  act(() => mounted.splice(0).forEach(renderer => renderer.unmount()));
  Object.defineProperty(Platform, 'OS', initialPlatform);
  jest.useRealTimers();
});

test('a default alert uses the shared themed card and cannot be dismissed accidentally', () => {
  const renderer = render();
  const stableAlert = alert;
  act(() => alert('Saved', 'Your changes are ready.'));
  expect(alert).toBe(stableAlert);
  expect(rootModal(renderer).props.visible).toBe(true);
  expect(dialog(renderer).props.buttons).toEqual([{ text: 'OK' }]);
  expect(renderer.root.findAllByType(ActionButton)[0].props.title).toBe('OK');

  act(() => {
    rootModal(renderer).props.onRequestClose();
    dialog(renderer).props.onDismiss();
  });
  expect(dialog(renderer).props.title).toBe('Saved');
  act(() => dialog(renderer).props.onSelect(0));
  expect(rootModal(renderer).props.visible).toBe(false);
});

test('destructive actions are red, cancel is neutral, and selecting cancel invokes only its callback once', () => {
  const renderer = render();
  const cancel = jest.fn();
  const remove = jest.fn();
  const dismissed = jest.fn();
  act(() =>
    alert(
      'Delete material?',
      'This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel', onPress: cancel },
        { text: 'Delete', style: 'destructive', onPress: remove },
      ],
      { cancelable: true, onDismiss: dismissed, icon: 'delete' },
    ),
  );
  const actions = renderer.root.findAllByType(ActionButton);
  expect(
    actions.map(action => [action.props.tone, action.props.variant]),
  ).toEqual([
    ['neutral', 'soft'],
    ['danger', 'solid'],
  ]);
  const select = dialog(renderer).props.onSelect;
  act(() => {
    select(0);
    select(0);
    select(1);
  });
  expect(cancel).toHaveBeenCalledTimes(1);
  expect(remove).not.toHaveBeenCalled();
  expect(dismissed).not.toHaveBeenCalled();
});

test.each(['backdrop', 'back'])(
  '%s dismisses a cancelable dialog once without selecting a cancel button',
  method => {
    const renderer = render();
    const cancel = jest.fn();
    const dismissed = jest.fn();
    act(() =>
      alert(
        'Leave?',
        '',
        [{ text: 'Cancel', style: 'cancel', onPress: cancel }],
        { cancelable: true, onDismiss: dismissed },
      ),
    );
    const dismiss =
      method === 'back'
        ? rootModal(renderer).props.onRequestClose
        : dialog(renderer).props.onDismiss;
    act(() => {
      dismiss();
      dismiss();
    });
    expect(dismissed).toHaveBeenCalledTimes(1);
    expect(cancel).not.toHaveBeenCalled();
  },
);

test('queued iOS alerts wait for native dismissal and stale button callbacks cannot consume the next alert', () => {
  const renderer = render();
  const first = jest.fn();
  const second = jest.fn();
  act(() => {
    alert('First', '', [{ text: 'Continue', onPress: first }]);
    alert('Second', '', [{ text: 'Continue', onPress: second }]);
  });
  const oldSelect = dialog(renderer).props.onSelect;
  act(() => oldSelect(0));
  expect(first).toHaveBeenCalledTimes(1);
  expect(rootModal(renderer).props.visible).toBe(false);
  expect(renderer.root.findAllByType(AppDialog)).toHaveLength(0);
  finishRootDismiss(renderer);
  expect(dialog(renderer).props.title).toBe('Second');
  act(() => oldSelect(0));
  expect(second).not.toHaveBeenCalled();
  expect(dialog(renderer).props.title).toBe('Second');
});

test('a callback can queue a handled failure after dismissal without losing the message', async () => {
  const renderer = render();
  act(() =>
    alert('Delete?', '', [
      {
        text: 'Delete',
        onPress: async () => {
          await Promise.resolve();
          alert('Delete failed', 'Please try again.');
        },
      },
    ]),
  );
  await act(async () => {
    dialog(renderer).props.onSelect(0);
    await Promise.resolve();
  });
  expect(rootModal(renderer).props.visible).toBe(false);
  finishRootDismiss(renderer);
  expect(dialog(renderer).props.title).toBe('Delete failed');
});

test('an unhandled rejected action is caught and becomes a themed error without calling it twice', async () => {
  const renderer = render();
  const callback = jest
    .fn()
    .mockRejectedValue(new Error('Private server detail'));
  act(() => alert('Continue?', '', [{ text: 'Continue', onPress: callback }]));
  const select = dialog(renderer).props.onSelect;
  await act(async () => {
    select(0);
    select(0);
    await Promise.resolve();
  });
  finishRootDismiss(renderer);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(dialog(renderer).props.title).toBe('Something went wrong');
  expect(dialog(renderer).props.message).not.toContain('Private server detail');
});

test('unmounting an owner removes its current and queued dialogs and suppresses late alerts', () => {
  const renderer = render();
  const lateAlert = alert;
  act(() => {
    alert('Old screen');
    alert('Old pending');
    otherAlert('New screen');
  });
  act(() => renderer.update(<Harness owner={false} />));
  expect(currentDialogId).toBeUndefined();
  act(() => lateAlert('Late response'));
  finishRootDismiss(renderer);
  expect(dialog(renderer).props.title).toBe('New screen');
  act(() => dialog(renderer).props.onSelect(0));
  finishRootDismiss(renderer);
  expect(renderer.root.findAllByType(AppDialog)).toHaveLength(0);
});

test('an open form hosts its dialog inline, hides form accessibility, and gives the dialog priority for Back', () => {
  const onClose = jest.fn();
  const dismissed = jest.fn();
  const renderer = render(<Harness host onClose={onClose} />);
  act(() =>
    alert('Unsaved changes', 'Keep editing?', undefined, {
      cancelable: true,
      onDismiss: dismissed,
    }),
  );
  expect(rootModal(renderer).props.visible).toBe(false);
  const nativeHost = hostModal(renderer);
  expect(nativeHost.findAllByType(AppDialog)).toHaveLength(1);
  const hiddenContent = nativeHost
    .findAllByType(View)
    .find(
      node => node.props.importantForAccessibility === 'no-hide-descendants',
    );
  expect(hiddenContent?.props.pointerEvents).toBe('none');
  act(() => nativeHost.props.onRequestClose());
  expect(dismissed).toHaveBeenCalledTimes(1);
  expect(onClose).not.toHaveBeenCalled();
  act(() => hostModal(renderer).props.onRequestClose());
  expect(onClose).toHaveBeenCalledTimes(1);
});

test('the last open modal hosts the dialog and a closing iOS form waits for onDismiss before opening a root dialog', () => {
  const onDismiss = jest.fn();
  const renderer = render(<Harness host secondHost onDismiss={onDismiss} />);
  act(() => alert('Newest host'));
  expect(
    hostModal(renderer, 'second-host').findAllByType(AppDialog),
  ).toHaveLength(1);
  act(() => dialog(renderer).props.onSelect(0));
  act(() => renderer.update(<Harness onDismiss={onDismiss} />));
  act(() => alert('After form closes'));
  expect(rootModal(renderer).props.visible).toBe(false);
  act(() => hostModal(renderer, 'second-host').props.onDismiss());
  expect(rootModal(renderer).props.visible).toBe(false);
  act(() => hostModal(renderer).props.onDismiss());
  expect(onDismiss).toHaveBeenCalledTimes(1);
  expect(rootModal(renderer).props.visible).toBe(true);
  expect(dialog(renderer).props.title).toBe('After form closes');
});

test('Android releases a closing form without requiring the iOS-only native onDismiss event', () => {
  platform = 'android';
  const renderer = render(<Harness host />);
  act(() => renderer.update(<Harness />));
  act(() => alert('After Android form'));
  expect(rootModal(renderer).props.visible).toBe(true);
  expect(dialog(renderer).props.title).toBe('After Android form');
});

test('a form requested while a root dialog is open waits for native dialog dismissal before presenting', () => {
  const renderer = render();
  act(() => alert('Notice before the form'));
  act(() => renderer.update(<Harness host />));
  expect(rootModal(renderer).props.visible).toBe(false);
  expect(hostModal(renderer).props.visible).toBe(false);
  finishRootDismiss(renderer);
  expect(hostModal(renderer).props.visible).toBe(true);
  expect(hostModal(renderer).findAllByType(AppDialog)).toHaveLength(1);
  expect(dialog(renderer).props.title).toBe('Notice before the form');
});

test('Android commits the hidden root modal before presenting the next queued alert', () => {
  platform = 'android';
  jest.useFakeTimers();
  const renderer = render();
  act(() => {
    alert('First');
    alert('Second');
  });
  act(() => dialog(renderer).props.onSelect(0));
  expect(rootModal(renderer).props.visible).toBe(false);
  act(() => jest.runOnlyPendingTimers());
  expect(rootModal(renderer).props.visible).toBe(true);
  expect(dialog(renderer).props.title).toBe('Second');
});

test('AppModal remains compatible with isolated form rendering without a provider', () => {
  const close = jest.fn();
  const renderer = render(
    <AppModal visible transparent onRequestClose={close}>
      <View testID="isolated" />
    </AppModal>,
  );
  const nativeModal = renderer.root.findByType(Modal);
  expect(nativeModal.props.visible).toBe(true);
  act(() => nativeModal.props.onRequestClose());
  expect(close).toHaveBeenCalledTimes(1);
});
