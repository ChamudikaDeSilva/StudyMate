import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { LogOut, UserRound, X } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ActionButton from '../common/ActionButton';
import AppModal from '../common/AppModal';
import { useAuth } from '../../hooks/useAuth';
import { useAppAlert } from '../../hooks/useAppAlert';
import { getInitials } from '../../utils/userUtils';
import { colors } from '../../constants/colors';

interface AccountMenuProps {
  displayName: string;
  onProfile: () => void;
}

const AccountMenu = ({ displayName, onProfile }: AccountMenuProps) => {
  const { logout } = useAuth();
  const { alert } = useAppAlert();
  const [visible, setVisible] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const mounted = useRef(true);
  const confirmingLogout = useRef(false);
  const logoutPending = useRef(false);

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);

  const closeMenu = () => {
    if (mounted.current) {
      setVisible(false);
    }
  };

  const cancelLogout = () => {
    confirmingLogout.current = false;
    closeMenu();
  };

  const signOut = async () => {
    if (!mounted.current || logoutPending.current) {
      return;
    }

    confirmingLogout.current = false;
    logoutPending.current = true;
    closeMenu();
    setLoggingOut(true);

    try {
      await logout();
    } catch {
      if (mounted.current) {
        alert(
          'Sign out failed',
          'Unable to sign out. Please try again.',
          undefined,
          { tone: 'danger' },
        );
      }
    } finally {
      logoutPending.current = false;
      if (mounted.current) {
        setLoggingOut(false);
      }
    }
  };

  const confirmLogout = () => {
    if (!mounted.current || confirmingLogout.current || logoutPending.current) {
      return;
    }

    confirmingLogout.current = true;
    closeMenu();
    alert(
      'Sign out?',
      'Sign in again whenever you’re ready to keep learning.',
      [
        { text: 'Cancel', style: 'cancel', onPress: cancelLogout },
        { text: 'Sign out', style: 'destructive', onPress: signOut },
      ],
      {
        cancelable: true,
        onDismiss: cancelLogout,
        tone: 'primary',
        icon: 'sign-out',
      },
    );
  };

  const viewProfile = () => {
    if (!mounted.current || confirmingLogout.current || logoutPending.current) {
      return;
    }

    closeMenu();
    onProfile();
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open account menu"
        accessibilityHint={`View profile or sign out of ${displayName}'s account`}
        accessibilityState={{ disabled: loggingOut, busy: loggingOut }}
        disabled={loggingOut}
        onPress={() => {
          if (
            mounted.current &&
            !confirmingLogout.current &&
            !logoutPending.current
          ) {
            setVisible(true);
          }
        }}
        className={`h-[46px] w-[46px] items-center justify-center rounded-full bg-brand-600 ${
          loggingOut ? 'opacity-60' : 'active:opacity-80'
        }`}
      >
        {loggingOut ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text className="text-lg font-bold text-white">
            {getInitials(displayName)}
          </Text>
        )}
      </Pressable>

      <AppModal
        transparent
        animationType="fade"
        visible={visible}
        statusBarTranslucent
        onRequestClose={closeMenu}
      >
        <View className="flex-1 justify-end bg-slate-900/50">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close account menu"
            onPress={closeMenu}
            className="absolute inset-0"
          />
          <SafeAreaView
            edges={['bottom', 'left', 'right']}
            accessibilityViewIsModal
            className="rounded-t-[26px] bg-white"
          >
            <View className="px-6 pb-6 pt-3">
              <View className="mb-4 h-[5px] w-[42px] self-center rounded-full bg-slate-200" />
              <View className="mb-6 flex-row items-center">
                <View className="flex-1">
                  <Text
                    accessibilityRole="header"
                    numberOfLines={2}
                    className="text-xl font-bold text-slate-900"
                  >
                    {displayName}
                  </Text>
                  <Text className="mt-1 text-sm text-slate-500">
                    Your account
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Close account menu"
                  onPress={closeMenu}
                  className="ml-3 h-11 w-11 items-center justify-center rounded-full bg-slate-100 active:opacity-70"
                >
                  <X size={20} color={colors.textSecondary} />
                </Pressable>
              </View>
              <ActionButton
                title="View profile"
                onPress={viewProfile}
                disabled={loggingOut}
                variant="soft"
                icon={<UserRound size={20} color={colors.primary} />}
              />
              <View className="mt-3">
                <ActionButton
                  title="Sign out"
                  onPress={confirmLogout}
                  loading={loggingOut}
                  tone="danger"
                  variant="soft"
                  icon={<LogOut size={20} color={colors.danger} />}
                />
              </View>
            </View>
          </SafeAreaView>
        </View>
      </AppModal>
    </>
  );
};

export default AccountMenu;
