import React from 'react';

import {
  SafeAreaView,
  Text,
  View,
} from 'react-native';

import AccountMenu from '../../components/home/AccountMenu';

import {useAuth} from '../../hooks/useAuth';

const ProfileScreen = () => {
  const {user} = useAuth();

  const displayName =
    user?.displayName?.trim() ||
    user?.email?.split('@')[0] ||
    'Student';

  const profileInitial =
    displayName
      .charAt(0)
      .toUpperCase() || 'U';

  return (
    <SafeAreaView
      className="
        flex-1
        bg-slate-50
      ">

      <View
        className="
          flex-1
          px-6
          pt-6
        ">

        <View
          className="
            flex-row
            items-center
            justify-between
          ">

          <Text
            className="
              text-[26px]
              font-bold
              text-slate-900
            ">
            Profile
          </Text>

          <AccountMenu
            displayName={
              displayName
            }
          />

        </View>

        <View
          className="
            mt-10
            items-center
            rounded-3xl
            border
            border-slate-200
            bg-white
            p-6
          ">

          <View
            className="
              h-20
              w-20
              items-center
              justify-center
              rounded-full
              bg-indigo-100
            ">

            <Text
              className="
                text-3xl
                font-bold
                text-indigo-600
              ">
              {profileInitial}
            </Text>

          </View>

          <Text
            className="
              mt-5
              text-xl
              font-bold
              text-slate-900
            ">
            {displayName}
          </Text>

          {!!user?.email && (
            <Text
              className="
                mt-1
                text-sm
                text-slate-500
              ">
              {user.email}
            </Text>
          )}

        </View>

      </View>

    </SafeAreaView>
  );
};

export default ProfileScreen;