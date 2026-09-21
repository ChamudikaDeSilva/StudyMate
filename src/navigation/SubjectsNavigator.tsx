import React from 'react';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import SubjectsScreen from '../screens/subjects/SubjectsScreen';

import SubjectMaterialsScreen from '../screens/materials/SubjectMaterialsScreen';
import AddMaterialScreen from '../screens/materials/AddMaterialScreen';
import MaterialDetailsScreen from '../screens/materials/MaterialDetailsScreen';

import {
  SubjectsStackParamList,
} from './navigationTypes';

const Stack =
  createNativeStackNavigator<
    SubjectsStackParamList
  >();

const SubjectsNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="SubjectsHome"
      screenOptions={{
        headerShown: false,
      }}>

      <Stack.Screen
        name="SubjectsHome"
        component={SubjectsScreen}
      />

      <Stack.Screen
        name="SubjectMaterials"
        component={
          SubjectMaterialsScreen
        }
      />

      <Stack.Screen
        name="AddMaterial"
        component={
          AddMaterialScreen
        }
      />

      <Stack.Screen
        name="MaterialDetails"
        component={
          MaterialDetailsScreen
        }
      />

    </Stack.Navigator>
  );
};

export default SubjectsNavigator;