import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import HomeScreen from '../screens/home/HomeScreen';
import {MainStackParamList} from './navigationTypes';

const Stack = createNativeStackNavigator<MainStackParamList>();

const MainNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{title: 'StudyMate'}}
      />
    </Stack.Navigator>
  );
};

export default MainNavigator;