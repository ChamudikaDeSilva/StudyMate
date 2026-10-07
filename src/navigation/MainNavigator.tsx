import React from 'react';

import {
  View,
} from 'react-native';

import {
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';

import {
  BookOpen,
  BrainCircuit,
  Home,
  UserRound,
} from 'lucide-react-native';

import HomeScreen from '../screens/home/HomeScreen';
import QuizScreen from '../screens/quiz/QuizScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

import SubjectsNavigator from './SubjectsNavigator';

import {
  MainTabParamList,
} from './navigationTypes';

const Tab =
  createBottomTabNavigator<
    MainTabParamList
  >();

const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,

        tabBarActiveTintColor:
          '#4F46E5',

        tabBarInactiveTintColor:
          '#94A3B8',

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 4,
        },

        tabBarStyle: {
          height: 76,
          paddingTop: 9,
          paddingBottom: 8,

          borderTopWidth: 1,
          borderTopColor:
            '#E2E8F0',

          backgroundColor:
            '#FFFFFF',
        },

        tabBarIcon: ({
          focused,
          color,
        }) => {
          let Icon;

          switch (route.name) {
            case 'Home':
              Icon = Home;
              break;

            case 'Subjects':
              Icon = BookOpen;
              break;

            case 'Quiz':
              Icon =
                BrainCircuit;
              break;

            case 'Profile':
              Icon =
                UserRound;
              break;

            default:
              Icon = Home;
          }

          return (
            <View
              className={`
                h-8
                w-8
                items-center
                justify-center
                rounded-lg

                ${
                  focused
                    ? 'bg-indigo-50'
                    : 'bg-transparent'
                }
              `}>

              <Icon
                size={20}
                color={color}
                strokeWidth={
                  focused
                    ? 2.4
                    : 2
                }
              />

            </View>
          );
        },
      })}>

      <Tab.Screen
        name="Home"
        component={HomeScreen}
      />

      <Tab.Screen
        name="Subjects"
        component={
          SubjectsNavigator
        }
      />

      <Tab.Screen
        name="Quiz"
        component={QuizScreen}
      />

      <Tab.Screen
        name="Profile"
        component={
          ProfileScreen
        }
      />

    </Tab.Navigator>
  );
};

export default MainNavigator;