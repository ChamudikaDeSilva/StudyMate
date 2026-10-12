import React, {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AlertButton,
  AlertOptions,
  Modal,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import AppDialog from '../components/common/AppDialog';

export type AppAlertTone =
  | 'primary'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger';
export type AppAlertOptions = AlertOptions & {
  tone?: AppAlertTone;
  icon?: 'sign-out' | 'delete' | 'connection';
};
export type AppAlert = (
  title: string,
  message?: string,
  buttons?: AlertButton[],
  options?: AppAlertOptions,
) => void;

export interface AppAlertEntry {
  id: number;
  owner: string;
  title: string;
  message?: string;
  buttons: AlertButton[];
  options: AppAlertOptions;
}

interface ModalHost {
  order: number;
  closing: boolean;
}

interface DialogSnapshot {
  active: AppAlertEntry | null;
  hostId: string | null;
  rootVisible: boolean;
}

interface AppAlertContextValue extends DialogSnapshot {
  rootClosing: boolean;
  addOwner: (id: string) => void;
  removeOwner: (id: string) => void;
  enqueue: (owner: string, ...args: Parameters<AppAlert>) => void;
  registerHost: (id: string) => void;
  closeHost: (id: string) => void;
  removeHost: (id: string) => void;
  select: (id: number, index: number) => void;
  dismiss: (id: number) => void;
}

export const AppAlertContext = createContext<AppAlertContextValue | null>(null);

/** One queue coordinates dialogs across screens and already-open native modals. */
export const AppAlertProvider = ({ children }: { children: ReactNode }) => {
  const [snapshot, setSnapshot] = useState<DialogSnapshot>({
    active: null,
    hostId: null,
    rootVisible: false,
  });
  const [revision, setRevision] = useState(0);
  const state = useRef(snapshot);
  const owners = useRef(new Set<string>());
  const hosts = useRef(new Map<string, ModalHost>());
  const queue = useRef<AppAlertEntry[]>([]);
  const nextId = useRef(0);
  const hostOrder = useRef(0);
  const rootClosing = useRef(false);
  const mounted = useRef(true);

  const refresh = useCallback(() => {
    if (mounted.current) {
      setRevision(value => value + 1);
    }
  }, []);
  const publish = useCallback((next: DialogSnapshot) => {
    state.current = next;
    if (mounted.current) {
      setSnapshot(next);
    }
  }, []);

  const enqueue = useCallback(
    (
      owner: string,
      title: string,
      message?: string,
      buttons?: AlertButton[],
      options: AppAlertOptions = {},
    ) => {
      if (!mounted.current || !owners.current.has(owner)) {
        return;
      }
      queue.current.push({
        id: ++nextId.current,
        owner,
        title,
        message,
        buttons: buttons?.length ? buttons : [{ text: 'OK' }],
        options,
      });
      refresh();
    },
    [refresh],
  );

  const hide = useCallback(() => {
    const current = state.current;
    // A synchronous ref consumes the dialog before any caller callback runs.
    if (current.rootVisible) {
      rootClosing.current = true;
    }
    publish({ active: null, hostId: null, rootVisible: false });
    refresh();
  }, [publish, refresh]);

  const invoke = useCallback(
    (
      entry: AppAlertEntry,
      callback?: AlertButton['onPress'] | AlertOptions['onDismiss'],
    ) => {
      if (!callback) {
        return;
      }
      const failed = () =>
        enqueue(
          entry.owner,
          'Something went wrong',
          'We couldn’t complete that action. Please try again.',
          undefined,
          { tone: 'danger' },
        );
      try {
        // AlertButton accepts void callbacks, which may still be async at runtime.
        const result = (callback as () => unknown)();
        if (
          result &&
          typeof (result as PromiseLike<unknown>).then === 'function'
        ) {
          Promise.resolve(result).catch(failed);
        }
      } catch {
        failed();
      }
    },
    [enqueue],
  );

  const select = useCallback(
    (id: number, index: number) => {
      const current = state.current.active;
      if (!current || current.id !== id || !current.buttons[index]) {
        return;
      }
      hide();
      invoke(current, current.buttons[index].onPress);
    },
    [hide, invoke],
  );
  const dismiss = useCallback(
    (id: number) => {
      const current = state.current.active;
      if (!current || current.id !== id || !current.options.cancelable) {
        return;
      }
      hide();
      invoke(current, current.options.onDismiss);
    },
    [hide, invoke],
  );
  const addOwner = useCallback((id: string) => {
    owners.current.add(id);
  }, []);
  const removeOwner = useCallback(
    (id: string) => {
      owners.current.delete(id);
      queue.current = queue.current.filter(entry => entry.owner !== id);
      if (state.current.active?.owner === id) {
        hide();
      } else {
        refresh();
      }
    },
    [hide, refresh],
  );
  const registerHost = useCallback(
    (id: string) => {
      const existing = hosts.current.get(id);
      if (existing) {
        return;
      }
      hosts.current.set(id, { order: ++hostOrder.current, closing: false });
      refresh();
    },
    [refresh],
  );
  const closeHost = useCallback(
    (id: string) => {
      const host = hosts.current.get(id);
      if (!host || host.closing) {
        return;
      }
      if (Platform.OS === 'ios') {
        host.closing = true;
      } else {
        hosts.current.delete(id);
      }
      refresh();
    },
    [refresh],
  );
  const removeHost = useCallback(
    (id: string) => {
      if (hosts.current.delete(id)) {
        refresh();
      }
    },
    [refresh],
  );

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      queue.current = [];
    };
  }, []);

  useEffect(() => {
    if (rootClosing.current) {
      // Android does not emit Modal.onDismiss. Wait for the hidden render to
      // commit, then allow the next dialog in a separate event-loop turn.
      if (Platform.OS !== 'ios') {
        const timer = setTimeout(() => {
          rootClosing.current = false;
          refresh();
        }, 0);
        return () => clearTimeout(timer);
      }
      return;
    }
    const ordered = [...hosts.current.entries()].sort(
      ([, left], [, right]) => right.order - left.order,
    );
    const visible = ordered.find(([, host]) => !host.closing)?.[0] ?? null;
    // The latest native modal must finish dismissal before anything is
    // presented in the window beneath it, especially on iOS.
    const newest = ordered[0];
    const blocked = !!newest?.[1].closing;
    const current = state.current;
    if (blocked) {
      if (current.rootVisible || current.hostId) {
        if (current.rootVisible) {
          rootClosing.current = true;
          refresh();
        }
        publish({ ...current, hostId: null, rootVisible: false });
      }
      return;
    }
    if (current.active) {
      if (current.rootVisible && visible) {
        rootClosing.current = true;
        publish({ ...current, hostId: null, rootVisible: false });
        refresh();
      } else if (
        current.hostId !== visible ||
        current.rootVisible !== !visible
      ) {
        publish({ ...current, hostId: visible, rootVisible: !visible });
      }
      return;
    }
    const next = queue.current.shift();
    if (next) {
      publish({ active: next, hostId: visible, rootVisible: !visible });
    }
  }, [publish, refresh, revision]);

  const isRootClosing = rootClosing.current;
  const value = useMemo(
    () => ({
      ...snapshot,
      rootClosing: isRootClosing,
      addOwner,
      removeOwner,
      enqueue,
      registerHost,
      closeHost,
      removeHost,
      select,
      dismiss,
    }),
    [
      snapshot,
      isRootClosing,
      addOwner,
      removeOwner,
      enqueue,
      registerHost,
      closeHost,
      removeHost,
      select,
      dismiss,
    ],
  );

  return (
    <AppAlertContext.Provider value={value}>
      <View
        style={styles.content}
        pointerEvents={snapshot.rootVisible ? 'none' : 'auto'}
        accessibilityElementsHidden={snapshot.rootVisible}
        importantForAccessibility={
          snapshot.rootVisible ? 'no-hide-descendants' : 'auto'
        }
      >
        {children}
      </View>
      <Modal
        testID="app-dialog-modal"
        visible={snapshot.rootVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={() => {
          const current = state.current.active;
          if (current) {
            dismiss(current.id);
          }
        }}
        onDismiss={() => {
          rootClosing.current = false;
          refresh();
        }}
      >
        {snapshot.rootVisible && snapshot.active && (
          <AppDialog
            title={snapshot.active.title}
            message={snapshot.active.message}
            buttons={snapshot.active.buttons}
            options={snapshot.active.options}
            onSelect={index => select(snapshot.active!.id, index)}
            onDismiss={() => dismiss(snapshot.active!.id)}
          />
        )}
      </Modal>
    </AppAlertContext.Provider>
  );
};

const styles = StyleSheet.create({ content: { flex: 1 } });
