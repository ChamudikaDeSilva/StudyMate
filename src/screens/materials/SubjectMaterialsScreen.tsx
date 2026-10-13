import React from 'react';

import { ScrollView, Text, View } from 'react-native';

import { BookOpen } from 'lucide-react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

import BottomActionBar from '../../components/common/BottomActionBar';

import OverviewCard from '../../components/common/OverviewCard';

import ScreenHeader from '../../components/common/ScreenHeader';

import SearchBar from '../../components/common/SearchBar';
import ScreenContainer from '../../components/common/ScreenContainer';

import MaterialFilters from '../../components/materials/MaterialFilters';

import MaterialsList from '../../components/materials/MaterialsList';

import { useSubjectMaterialsScreen } from '../../hooks/useSubjectMaterialsScreen';

import { SubjectsStackParamList } from '../../navigation/navigationTypes';

type Props = NativeStackScreenProps<SubjectsStackParamList, 'SubjectMaterials'>;

const SubjectMaterialsScreen = ({ navigation, route }: Props) => {
  const { subjectId, subjectName } = route.params;

  const screen = useSubjectMaterialsScreen(subjectId);

  const openAddMaterial = () => {
    navigation.navigate(
      'AddMaterial',

      {
        subjectId,
        subjectName,
      },
    );
  };

  return (
    <ScreenContainer>
      <View className="flex-1">
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="w-full max-w-[680px] self-center px-6 pb-6 pt-6">
            {/* Header */}

            <ScreenHeader
              eyebrow="Learning library"
              title={subjectName}
              subtitle="Everything you need to study this subject."
              onBack={() => navigation.goBack()}
            />

            {/* Overview */}

            <View className="mb-6">
              <OverviewCard
                kicker="YOUR STUDY COLLECTION"
                value={screen.materials.length}
                description={
                  screen.materials.length === 1
                    ? 'material saved in this subject'
                    : 'materials saved in this subject'
                }
                icon={BookOpen}
              />
            </View>

            {/* Search */}

            <View className="mb-4">
              <SearchBar
                value={screen.searchText}
                onChangeText={screen.setSearchText}
                placeholder="Search materials..."
              />
            </View>

            {/* Filters */}

            <View className="mb-8">
              <MaterialFilters
                activeFilter={screen.activeFilter}
                onChange={screen.setActiveFilter}
              />
            </View>

            {/* Heading */}

            <View className="mb-4 flex-row items-center">
              <Text className="text-lg font-bold text-ink">Your materials</Text>

              {!screen.loading && (
                <View className="ml-2 min-w-[28px] items-center rounded-full bg-brand-100 px-2 py-1">
                  <Text className="text-xs font-bold text-brand-600">
                    {screen.filteredMaterials.length}
                  </Text>
                </View>
              )}
            </View>

            {/* Materials */}

            <MaterialsList
              materials={screen.filteredMaterials}
              loading={screen.loading}
              showLoadError={screen.showLoadError}
              emptyTitle={screen.emptyTitle}
              emptyDescription={screen.emptyDescription}
              hasSearch={screen.hasSearch}
              hasActiveFilter={screen.hasActiveFilter}
              onRetry={screen.loadMaterials}
              onOpenMaterial={material => {
                navigation.navigate(
                  'MaterialDetails',

                  {
                    materialId: material.id,

                    subjectId,

                    subjectName,
                  },
                );
              }}
            />
          </View>
        </ScrollView>

        <BottomActionBar title="Add material" onPress={openAddMaterial} />
      </View>
    </ScreenContainer>
  );
};

export default SubjectMaterialsScreen;
