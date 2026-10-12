import {
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';
import { AppAlert, AppAlertContext } from '../context/AppAlertContext';

export const useAppAlert = (): { alert: AppAlert } => {
  const context = useContext(AppAlertContext);
  const owner = useId();
  const alive = useRef(false);
  if (!context) {
    throw new Error('useAppAlert must be used within AppAlertProvider');
  }
  const { addOwner, removeOwner, enqueue } = context;
  useLayoutEffect(() => {
    alive.current = true;
    addOwner(owner);
    return () => {
      alive.current = false;
      removeOwner(owner);
    };
  }, [addOwner, removeOwner, owner]);
  const alert = useCallback<AppAlert>(
    (...args) => {
      if (alive.current) {
        enqueue(owner, ...args);
      }
    },
    [enqueue, owner],
  );
  return useMemo(() => ({ alert }), [alert]);
};

export default useAppAlert;
