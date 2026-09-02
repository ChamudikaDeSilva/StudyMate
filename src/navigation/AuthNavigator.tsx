import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import {AuthStackParamList} from './navigationTypes';

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{title: 'Create Account'}}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;