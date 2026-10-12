import React from 'react';

import { ScrollView, Text, View } from 'react-native';

import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import { BookOpen } from 'lucide-react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

import BottomActionBar from '../../components/common/BottomActionBar';

import OverviewCard from '../../components/common/OverviewCard';

import ScreenHeader from '../../components/common/ScreenHeader';

import SearchBar from '../../components/common/SearchBar';
import ScreenContainer from '../../components/common/ScreenContainer';

import AccountMenu from '../../components/home/AccountMenu';

import SubjectActionsSheet from '../../components/subjects/SubjectActionsSheet';

import SubjectFormModal from '../../components/subjects/SubjectFormModal';

import SubjectsList from '../../components/subjects/SubjectsList';

import {
  MainTabParamList,
  SubjectsStackParamList,
} from '../../navigation/navigationTypes';

import { useSubjectsScreen } from '../../hooks/useSubjectsScreen';

type Props = NativeStackScreenProps<SubjectsStackParamList, 'SubjectsHome'>;

const SubjectsScreen = ({ navigation }: Props) => {
  const screen = useSubjectsScreen();

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
              eyebrow="Your workspace"
              title="Subjects"
              subtitle="Organize everything you're learning."
              right={
                <AccountMenu
                  onProfile={() =>
                    navigation
                      .getParent<BottomTabNavigationProp<MainTabParamList>>()
                      ?.navigate('Profile')
                  }
                  displayName={screen.displayName}
                />
              }
            />

            {/* Overview */}

            <View className="mb-6">
              <OverviewCard
                kicker="YOUR LEARNING LIBRARY"
                value={screen.subjects.length}
                description={
                  screen.subjects.length === 1
                    ? 'subject ready for your learning materials'
                    : 'subjects ready for your learning materials'
                }
                icon={BookOpen}
              />
            </View>

            {/* Search */}

            <View className="mb-8">
              <SearchBar
                value={screen.searchText}
                onChangeText={screen.setSearchText}
                placeholder="Search your subjects..."
              />
            </View>

            {/* Section heading */}

            <View className="mb-4 flex-row items-center">
              <Text className="text-lg font-bold text-ink">Your subjects</Text>

              {!screen.loading && (
                <View className="ml-2 min-w-[28px] items-center rounded-full bg-brand-100 px-2 py-1">
                  <Text className="text-xs font-bold text-brand-600">
                    {screen.filteredSubjects.length}
                  </Text>
                </View>
              )}
            </View>

            {/* Subject list */}

            <SubjectsList
              subjects={screen.filteredSubjects}
              loading={screen.loading}
              showLoadError={screen.showLoadError}
              searchText={screen.searchText}
              onRetry={screen.loadSubjects}
              isSubjectBusy={screen.isSubjectBusy}
              onOptionsPress={screen.openActions}
              onOpenSubject={subject => {
                navigation.navigate(
                  'SubjectMaterials',

                  {
                    subjectId: subject.id,

                    subjectName: subject.name,
                  },
                );
              }}
            />
          </View>
        </ScrollView>

        <BottomActionBar
          title="Add subject"
          onPress={screen.openCreateSubject}
        />
      </View>

      <SubjectActionsSheet
        visible={screen.actionsVisible}
        subject={screen.selectedSubject}
        onClose={screen.closeActions}
        onEdit={screen.openEdit}
        onDelete={screen.confirmDelete}
      />

      <SubjectFormModal
        visible={screen.formVisible}
        editing={screen.editingSubject !== null}
        name={screen.name}
        description={screen.description}
        submitting={screen.submitting}
        onNameChange={screen.setName}
        onDescriptionChange={screen.setDescription}
        onClose={screen.closeForm}
        onSave={screen.saveSubject}
      />
    </ScreenContainer>
  );
};

export default SubjectsScreen;
