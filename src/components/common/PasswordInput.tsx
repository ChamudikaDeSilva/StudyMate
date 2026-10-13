import React, { forwardRef, useState } from 'react';
import { Platform, Pressable } from 'react-native';
import { Eye, EyeOff, LockKeyhole } from 'lucide-react-native';
import AppInput, { AppInputRef } from './AppInput';
import { colors } from '../../constants/colors';

type PasswordInputProps = Omit<
  React.ComponentPropsWithoutRef<typeof AppInput>,
  'secureTextEntry' | 'rightAccessory'
> & {
  visibilityLabel?: string;
};

const PasswordInput = forwardRef<AppInputRef, PasswordInputProps>(
  function PasswordField(
    {
      visibilityLabel = 'password',
      autoCapitalize = 'none',
      autoCorrect = false,
      autoComplete = 'current-password',
      textContentType = Platform.OS === 'ios' ? 'password' : undefined,
      editable = true,
      leftIcon = <LockKeyhole size={19} color={colors.textSecondary} />,
      ...inputProps
    },
    ref,
  ) {
    const [visible, setVisible] = useState(false);

    return (
      <AppInput
        {...inputProps}
        ref={ref}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        autoComplete={autoComplete}
        textContentType={textContentType}
        editable={editable}
        secureTextEntry={!visible}
        leftIcon={leftIcon}
        rightAccessory={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${
              visible ? 'Hide' : 'Show'
            } ${visibilityLabel}`}
            accessibilityState={{ disabled: !editable }}
            disabled={!editable}
            onPress={() => setVisible(current => !current)}
            className={`h-11 w-11 items-center justify-center rounded-xl ${
              editable ? 'active:opacity-55' : 'opacity-55'
            }`}
          >
            {visible ? (
              <EyeOff size={20} color={colors.textSecondary} />
            ) : (
              <Eye size={20} color={colors.textSecondary} />
            )}
          </Pressable>
        }
      />
    );
  },
);

export default PasswordInput;
