import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackHeaderProps,
  NativeStackNavigationOptions,
} from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialPreviewHeader from '../components/materials/MaterialPreviewHeader';
import { colors } from '../constants/colors';
import SubjectsScreen from '../screens/subjects/SubjectsScreen';
import SubjectMaterialsScreen from '../screens/materials/SubjectMaterialsScreen';
import AddMaterialScreen from '../screens/materials/AddMaterialScreen';
import MaterialDetailsScreen from '../screens/materials/MaterialDetailsScreen';
import PdfPreviewScreen from '../screens/materials/PdfPreviewScreen';
import ImagePreviewScreen from '../screens/materials/ImagePreviewScreen';
import MaterialSummaryScreen from '../screens/ai/MaterialSummaryScreen';
import MaterialFlashcardsScreen from '../screens/ai/MaterialFlashcardsScreen';
import MaterialQuizScreen from '../screens/ai/MaterialQuizScreen';
import MaterialQuizResultScreen from '../screens/ai/MaterialQuizResultScreen';
import { SubjectsStackParamList } from './navigationTypes';

const Stack = createNativeStackNavigator<SubjectsStackParamList>();

const PreviewHeader = ({ navigation, route }: NativeStackHeaderProps) => {
  const previewRoute = route as RouteProp<
    SubjectsStackParamList,
    'PdfPreview' | 'ImagePreview'
  >;
  const { materialId, subjectId, subjectName, title } = previewRoute.params;
  const image = previewRoute.name === 'ImagePreview';

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.replace('MaterialDetails', {
      materialId,
      subjectId,
      subjectName,
    });
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={image ? styles.darkHeader : styles.header}
    >
      <MaterialPreviewHeader
        title={title}
        subjectName={subjectName}
        sourceType={image ? 'image' : 'pdf'}
        tone={image ? 'dark' : 'light'}
        onBack={handleBack}
      />
    </SafeAreaView>
  );
};

const previewOptions: NativeStackNavigationOptions = {
  headerShown: true,
  header: PreviewHeader,
  headerShadowVisible: false,
};
const imageOptions: NativeStackNavigationOptions = {
  ...previewOptions,
  statusBarStyle: Platform.OS === 'android' ? 'light' : undefined,
  contentStyle: { backgroundColor: colors.darkBackground },
};
const stackOptions: NativeStackNavigationOptions = {
  headerShown: false,
  statusBarStyle: Platform.OS === 'android' ? 'dark' : undefined,
  contentStyle: { backgroundColor: colors.background },
};

const SubjectsNavigator = () => (
  <Stack.Navigator initialRouteName="SubjectsHome" screenOptions={stackOptions}>
    <Stack.Screen name="SubjectsHome" component={SubjectsScreen} />
    <Stack.Screen name="SubjectMaterials" component={SubjectMaterialsScreen} />
    <Stack.Screen name="AddMaterial" component={AddMaterialScreen} />
    <Stack.Screen name="MaterialDetails" component={MaterialDetailsScreen} />
    <Stack.Screen name="MaterialSummary" component={MaterialSummaryScreen} />
    <Stack.Screen
      name="MaterialFlashcards"
      component={MaterialFlashcardsScreen}
    />
    <Stack.Screen name="MaterialQuiz" component={MaterialQuizScreen} />
    <Stack.Screen
      name="MaterialQuizResult"
      component={MaterialQuizResultScreen}
    />
    <Stack.Screen
      name="PdfPreview"
      component={PdfPreviewScreen}
      options={previewOptions}
    />
    <Stack.Screen
      name="ImagePreview"
      component={ImagePreviewScreen}
      options={imageOptions}
    />
  </Stack.Navigator>
);

const styles = StyleSheet.create({
  header: { backgroundColor: colors.surface },
  darkHeader: { backgroundColor: colors.darkBackground },
});

export default SubjectsNavigator;
