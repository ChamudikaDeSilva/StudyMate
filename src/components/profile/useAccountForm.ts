import { useEffect, useRef } from 'react';
import { useAuthForm } from '../../hooks/useAuthForm';

interface AccountFormOptions<T> {
  onSave: (values: T) => Promise<void>;
  onSaved: (values: T) => void;
  onClose: () => void;
  onInvalid: (field: keyof T) => void;
  fallbackMessage: string;
}

// Keep all dismissal paths locked from the moment a request starts.
const useAccountForm = <T extends Record<string, string>>(
  initialValues: T,
  validate: (values: T) => Partial<Record<keyof T, string>>,
  options: AccountFormOptions<T>,
) => {
  const form = useAuthForm(initialValues, validate);
  const savingRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const close = () => {
    if (!savingRef.current) {
      options.onClose();
    }
  };

  const save = () =>
    form.submit({
      onValid: async values => {
        savingRef.current = true;
        try {
          await options.onSave(values);
          if (mountedRef.current) {
            options.onSaved(values);
          }
        } finally {
          savingRef.current = false;
        }
      },
      onInvalid: options.onInvalid,
      fallbackMessage: options.fallbackMessage,
    });

  return { ...form, close, save };
};

export default useAccountForm;
