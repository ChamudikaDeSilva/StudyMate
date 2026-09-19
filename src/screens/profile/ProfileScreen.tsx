import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import AccountMenu from '../../components/home/AccountMenu';

import {colors} from '../../constants/colors';
import {useAuth} from '../../hooks/useAuth';

const ProfileScreen = () => {
  const {user} = useAuth();

  const displayName =
    user?.displayName?.trim() ||
    user?.email?.split('@')[0] ||
    'Student';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        <View style={styles.header}>
          <Text style={styles.title}>
            Profile
          </Text>

          <AccountMenu
            displayName={displayName}
          />
        </View>

        <Text style={styles.name}>
          {displayName}
        </Text>

        {!!user?.email && (
          <Text style={styles.email}>
            {user.email}
          </Text>
        )}

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  container: {
    flex: 1,
    padding: 24,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  name: {
    marginTop: 40,

    fontSize: 20,
    fontWeight: '700',

    color: colors.textPrimary,
  },

  email: {
    marginTop: 6,

    fontSize: 14,

    color: colors.textSecondary,
  },
});

export default ProfileScreen;