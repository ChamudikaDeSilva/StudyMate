import React from 'react';

import {
  Pressable,
} from 'react-native';

import {
  ArrowLeft,
} from 'lucide-react-native';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import {
  SubjectsStackParamList,
} from './navigationTypes';

import SubjectsScreen
  from '../screens/subjects/SubjectsScreen';

import SubjectMaterialsScreen
  from '../screens/materials/SubjectMaterialsScreen';

import AddMaterialScreen
  from '../screens/materials/AddMaterialScreen';

import MaterialDetailsScreen
  from '../screens/materials/MaterialDetailsScreen';

import PdfPreviewScreen
  from '../screens/materials/PdfPreviewScreen';

import ImagePreviewScreen
  from '../screens/materials/ImagePreviewScreen';


const Stack =
  createNativeStackNavigator<
    SubjectsStackParamList
  >();


const createPreviewOptions = (
  title: string,
  navigation: any,
) => ({

  headerShown:
    true,

  headerBackVisible:
    false,

  headerShadowVisible:
    true,

  headerTitle:
    title,

  headerTitleStyle: {
    fontSize:
      16,

    fontWeight:
      '700' as const,

    color:
      '#0F172A',
  },

  headerStyle: {
    backgroundColor:
      '#FFFFFF',
  },

  headerLeft:
    () => (

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        onPress={() =>
          navigation.goBack()
        }
        style={({
          pressed,
        }) => ({

          width:
            42,

          height:
            42,

          marginRight:
            12,

          alignItems:
            'center',

          justifyContent:
            'center',

          borderRadius:
            12,

          borderWidth:
            1,

          borderColor:
            '#E2E8F0',

          backgroundColor:
            '#FFFFFF',

          opacity:
            pressed
              ? 0.65
              : 1,
        })}>

        <ArrowLeft
          size={21}
          color="#0F172A"
        />

      </Pressable>
    ),
});


const SubjectsNavigator =
  () => {

    return (

      <Stack.Navigator
        screenOptions={{
          headerShown:
            false,
        }}>

        <Stack.Screen
          name="Subjects"
          component={
            SubjectsScreen
          }
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


        <Stack.Screen
          name="PdfPreview"
          component={
            PdfPreviewScreen
          }
          options={({
            navigation,
            route,
          }) =>
            createPreviewOptions(
              route.params.title,
              navigation,
            )
          }
        />


        <Stack.Screen
          name="ImagePreview"
          component={
            ImagePreviewScreen
          }
          options={({
            navigation,
            route,
          }) =>
            createPreviewOptions(
              route.params.title,
              navigation,
            )
          }
        />

      </Stack.Navigator>
    );
  };


export default SubjectsNavigator;