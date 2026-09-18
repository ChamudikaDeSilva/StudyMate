import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import HomeScreen from '../screens/home/HomeScreen';
import SubjectsScreen from '../screens/subjects/SubjectsScreen';
import {MainStackParamList} from './navigationTypes';

const Stack = createNativeStackNavigator<MainStackParamList>();

const MainNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="Home"
      component={HomeScreen}
      options={{title: 'LearnLoop AI'}}
    />

    <Stack.Screen
      name="Subjects"
      component={SubjectsScreen}
      options={{title: 'My Subjects'}}
    />
  </Stack.Navigator>
);

export default MainNavigator;