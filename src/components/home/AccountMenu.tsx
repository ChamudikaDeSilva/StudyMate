import React, {useState} from 'react';

import {
  Alert,
  Pressable,
  Text,
} from 'react-native';

import {useAuth} from '../../hooks/useAuth';

interface AccountMenuProps {
  displayName: string;
}

const AccountMenu = ({
  displayName,
}: AccountMenuProps) => {
  const {logout} = useAuth();

  const [
    loggingOut,
    setLoggingOut,
  ] = useState(false);

  const profileInitial =
    displayName
      .charAt(0)
      .toUpperCase() || 'U';

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',

          onPress: async () => {
            try {
              setLoggingOut(true);

              await logout();
            } catch (error) {
              console.error(
                'Logout error:',
                error,
              );

              Alert.alert(
                'Sign Out Failed',
                'Unable to sign out. Please try again.',
              );
            } finally {
              setLoggingOut(false);
            }
          },
        },
      ],
      {
        cancelable: true,
      },
    );
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Sign out"
      disabled={loggingOut}
      onPress={handleLogout}
      className={`
        h-[46px]
        w-[46px]
        items-center
        justify-center
        rounded-full
        bg-indigo-600

        ${
          loggingOut
            ? 'opacity-60'
            : 'active:scale-95 active:opacity-80'
        }
      `}>

      <Text
        className="
          text-lg
          font-bold
          text-white
        ">
        {profileInitial}
      </Text>

    </Pressable>
  );
};

export default AccountMenu;