import React from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/home/HomeScreen';
import SubjectsScreen from '../screens/subjects/SubjectsScreen';

import QuizScreen from '../screens/quiz/QuizScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

import {colors} from '../constants/colors';
import {MainTabParamList} from './navigationTypes';

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,

        tabBarActiveTintColor: colors.textPrimary,
        tabBarInactiveTintColor: colors.textMuted,

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginBottom: 4,
        },

        tabBarStyle: {
          height: 76,
          paddingTop: 10,
          paddingBottom: 8,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.surface,
        },

        tabBarIcon: ({focused}) => (
          <View
            style={[
              styles.tabIcon,
              focused && styles.tabIconActive,
            ]}
          />
        ),
      })}>

      <Tab.Screen
        name="Home"
        component={HomeScreen}
      />

      <Tab.Screen
        name="Subjects"
        component={SubjectsScreen}
      />

      <Tab.Screen
        name="Quiz"
        component={QuizScreen}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
      />

    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: colors.border,
  },

  tabIconActive: {
    backgroundColor: colors.primary,
  },
});

export default MainNavigator;