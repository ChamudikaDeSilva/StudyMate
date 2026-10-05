import React from 'react';

import {
  Text,
  View,
} from 'react-native';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import BackButton
  from '../components/common/BackButton';

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

import {
  SubjectsStackParamList,
} from './navigationTypes';


const Stack =
  createNativeStackNavigator<
    SubjectsStackParamList
  >();


const SubjectsNavigator =
  () => {

    return (
      <Stack.Navigator
        initialRouteName="SubjectsHome"
        screenOptions={{
          headerShown:
            false,
        }}>

        {/* ===============================================
            SUBJECTS
        ================================================ */}

        <Stack.Screen
          name="SubjectsHome"
          component={
            SubjectsScreen
          }
        />


        {/* ===============================================
            SUBJECT MATERIALS
        ================================================ */}

        <Stack.Screen
          name="SubjectMaterials"
          component={
            SubjectMaterialsScreen
          }
        />


        {/* ===============================================
            ADD MATERIAL
        ================================================ */}

        <Stack.Screen
          name="AddMaterial"
          component={
            AddMaterialScreen
          }
        />


        {/* ===============================================
            MATERIAL DETAILS
        ================================================ */}

        <Stack.Screen
          name="MaterialDetails"
          component={
            MaterialDetailsScreen
          }
        />


        {/* ===============================================
            PDF PREVIEW
        ================================================ */}

        <Stack.Screen
          name="PdfPreview"
          component={
            PdfPreviewScreen
          }
          options={({
            navigation,
            route,
          }) => ({

            headerShown:
              true,

            headerBackVisible:
              false,

            headerShadowVisible:
              true,

            headerStyle: {
              backgroundColor:
                '#FFFFFF',
            },

            headerLeft:
              () => (

                <View
                  className="
                    mr-3
                  ">

                  <BackButton
                    onPress={() => {

                      if (
                        navigation.canGoBack()
                      ) {

                        navigation.goBack();

                        return;
                      }


                      navigation.replace(
                        'MaterialDetails',
                        {
                          materialId:
                            route.params.materialId,

                          subjectId:
                            route.params.subjectId,

                          subjectName:
                            route.params.subjectName,
                        },
                      );
                    }}
                  />

                </View>
              ),

            headerTitle:
              () => (

                <View>

                  <Text
                    numberOfLines={1}
                    className="
                      max-w-[240px]
                      text-base
                      font-bold
                      text-slate-900
                    ">

                    {route.params.title}

                  </Text>


                  <Text
                    numberOfLines={1}
                    className="
                      mt-0.5
                      text-xs
                      text-slate-500
                    ">

                    {route.params.subjectName}

                  </Text>

                </View>
              ),
          })}
        />


        {/* ===============================================
            IMAGE PREVIEW
        ================================================ */}

        <Stack.Screen
          name="ImagePreview"
          component={
            ImagePreviewScreen
          }
          options={({
            navigation,
            route,
          }) => ({

            headerShown:
              true,

            headerBackVisible:
              false,

            headerShadowVisible:
              true,

            headerStyle: {
              backgroundColor:
                '#FFFFFF',
            },

            headerLeft:
              () => (

                <View
                  className="
                    mr-3
                  ">

                  <BackButton
                    onPress={() => {

                      if (
                        navigation.canGoBack()
                      ) {

                        navigation.goBack();

                        return;
                      }


                      navigation.replace(
                        'MaterialDetails',
                        {
                          materialId:
                            route.params.materialId,

                          subjectId:
                            route.params.subjectId,

                          subjectName:
                            route.params.subjectName,
                        },
                      );
                    }}
                  />

                </View>
              ),

            headerTitle:
              () => (

                <View>

                  <Text
                    numberOfLines={1}
                    className="
                      max-w-[240px]
                      text-base
                      font-bold
                      text-slate-900
                    ">

                    {route.params.title}

                  </Text>


                  <Text
                    numberOfLines={1}
                    className="
                      mt-0.5
                      text-xs
                      text-slate-500
                    ">

                    {route.params.subjectName}

                  </Text>

                </View>
              ),
          })}
        />

      </Stack.Navigator>
    );
  };


export default SubjectsNavigator;