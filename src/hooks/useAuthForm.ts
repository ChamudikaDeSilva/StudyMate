import { useEffect, useRef, useState } from 'react';

type FieldErrors<T> = Partial<Record<keyof T, string>>;
type TouchedFields<T> = Partial<Record<keyof T, boolean>>;

interface Submission<T> {
  onValid: (values: T) => Promise<void>;
  onInvalid?: (field: keyof T) => void;
  fallbackMessage: string;
}

export const validateEmail = (email: string) => {
  if (!email.trim()) {
    return 'Enter your email address.';
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return 'Enter a valid email address.';
  }

  return undefined;
};

export const useAuthForm = <T extends Record<string, string>>(
  initialValues: T,
  validate: (values: T) => FieldErrors<T>,
) => {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState<TouchedFields<T>>({});
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');
  const valuesRef = useRef(values);
  const submissionRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const validationErrors = validate(values);
  const errors: FieldErrors<T> = {};
  for (const field of Object.keys(values) as (keyof T)[]) {
    if (touched[field]) {
      errors[field] = validationErrors[field];
    }
  }

  const updateField = (field: keyof T, value: string) => {
    const nextValues = { ...valuesRef.current, [field]: value };
    valuesRef.current = nextValues;
    setValues(nextValues);
    setFeedback('');
  };

  const touchField = (field: keyof T) => {
    setTouched(current => ({ ...current, [field]: true }));
  };

  const submit = async ({
    onValid,
    onInvalid,
    fallbackMessage,
  }: Submission<T>) => {
    if (submissionRef.current) {
      return;
    }
    submissionRef.current = true;
    setFeedback('');

    const currentValues = valuesRef.current;
    const fields = Object.keys(currentValues) as (keyof T)[];
    const currentErrors = validate(currentValues);
    const firstInvalidField = fields.find(field => currentErrors[field]);
    const allTouched: TouchedFields<T> = {};
    for (const field of fields) {
      allTouched[field] = true;
    }
    setTouched(allTouched);

    if (firstInvalidField !== undefined) {
      submissionRef.current = false;
      onInvalid?.(firstInvalidField);
      return;
    }

    setSubmitting(true);
    try {
      await onValid(currentValues);
    } catch (error) {
      if (mountedRef.current) {
        setFeedback(
          error instanceof Error && error.message
            ? error.message
            : fallbackMessage,
        );
      }
    } finally {
      submissionRef.current = false;
      if (mountedRef.current) {
        setSubmitting(false);
      }
    }
  };

  return {
    values,
    errors,
    submitting,
    feedback,
    updateField,
    touchField,
    submit,
  };
};
