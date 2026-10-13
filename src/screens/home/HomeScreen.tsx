import React from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import {
  ArrowRight,
  BookOpen,
  FileText,
  Layers,
  LibraryBig,
  Lightbulb,
} from 'lucide-react-native';
import AuthBrand from '../../components/auth/AuthBrand';
import AppButton from '../../components/common/AppButton';
import ScreenContainer from '../../components/common/ScreenContainer';
import ScreenHeader from '../../components/common/ScreenHeader';
import ScreenState from '../../components/common/ScreenState';
import SectionCard from '../../components/common/SectionCard';
import AccountMenu from '../../components/home/AccountMenu';
import HomeStudyCard from '../../components/home/HomeStudyCard';
import SubjectCard from '../../components/subjects/SubjectCard';
import { colors } from '../../constants/colors';
import { subjectPalette } from '../../constants/subjectPalette';
import { Subject } from '../../domain/models/Subject';
import { useHomeScreen } from '../../hooks/useHomeScreen';
import { MainTabParamList } from '../../navigation/navigationTypes';

type Props = BottomTabScreenProps<MainTabParamList, 'Home'>;

const studySteps = [
  { title: 'Collect', icon: FileText },
  { title: 'Understand', icon: Lightbulb },
  { title: 'Practice', icon: Layers },
];

const HomeScreen = ({ navigation }: Props) => {
  const {
    displayName,
    firstName,
    subjects,
    recentSubjects,
    loading,
    refreshing,
    error,
    showLoadError,
    refreshSubjects,
  } = useHomeScreen();
  const featuredSubject = recentSubjects[0];
  const otherSubjects = recentSubjects.slice(1);
  const browseSubjects = () =>
    navigation.navigate('Subjects', { screen: 'SubjectsHome' });
  const openSubject = (subject: Subject) =>
    navigation.navigate('Subjects', {
      screen: 'SubjectMaterials',
      params: { subjectId: subject.id, subjectName: subject.name },
      initial: false,
    });

  return (
    <ScreenContainer>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshSubjects}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <View className="w-full max-w-[640px] self-center px-6 pb-8 pt-6">
          <View className="mb-7 flex-row items-center justify-between gap-3">
            <AuthBrand compact />
            <AccountMenu
              displayName={displayName}
              onProfile={() => navigation.navigate('Profile')}
            />
          </View>

          <ScreenHeader
            eyebrow="YOUR DAILY STARTING POINT"
            title={`Hi, ${firstName}`}
            subtitle="One idea at a time. Make a little room for learning."
          />

          {featuredSubject ? (
            <HomeStudyCard
              subject={featuredSubject}
              onPress={() => openSubject(featuredSubject)}
            />
          ) : (
            <SectionCard>
              {loading && !showLoadError ? (
                <ScreenState
                  loading
                  title="Opening your library"
                  description="Getting your subjects ready."
                />
              ) : showLoadError ? (
                <ScreenState
                  icon={LibraryBig}
                  title="Your library couldn't load"
                  description={
                    error || 'Please try again to see your subjects.'
                  }
                  actionTitle="Retry loading subjects"
                  onAction={refreshSubjects}
                />
              ) : (
                <ScreenState
                  icon={BookOpen}
                  title="Start with something you want to learn"
                  description="Create your first subject in the library, then add your notes, PDFs or images."
                  actionTitle="Browse subjects"
                  onAction={browseSubjects}
                />
              )}
            </SectionCard>
          )}

          {otherSubjects.length > 0 && (
            <View className="mt-7">
              <Text
                accessibilityRole="header"
                className="text-lg font-bold text-ink"
              >
                A little more to explore
              </Text>
              <Text className="mb-4 mt-1 text-sm text-muted">
                Another subject, another starting point.
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {otherSubjects.map(subject => (
                  <View key={subject.id} className="mr-3 w-[176px]">
                    <SubjectCard
                      subject={subject}
                      layout="tile"
                      accent={
                        subjectPalette[
                          subjects.findIndex(item => item.id === subject.id) %
                            subjectPalette.length
                        ]
                      }
                      onPress={() => openSubject(subject)}
                    />
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          <SectionCard label="MAKE IT A STUDY SESSION" className="mt-6">
            <View className="flex-row">
              {studySteps.map(({ title, icon: Icon }) => (
                <View key={title} className="flex-1 items-center">
                  <View className="mb-3 h-12 w-12 items-center justify-center rounded-2xl border border-brand-100 bg-brand-50">
                    <Icon size={22} color={colors.primary} strokeWidth={1.8} />
                  </View>
                  <Text className="text-center text-xs font-semibold text-ink">
                    {title}
                  </Text>
                </View>
              ))}
            </View>
            <Text className="mt-5 text-center text-sm leading-[22px] text-muted">
              Add a material, explore its summary, then practise with flashcards
              or a quiz.
            </Text>
          </SectionCard>

          {featuredSubject && (
            <View className="mt-6 flex-row items-center">
              <View className="mr-3 h-10 w-10 items-center justify-center rounded-2xl bg-brand-50">
                <LibraryBig size={20} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-ink">
                  Your full library
                </Text>
                <Text className="mt-0.5 text-xs text-muted">
                  {subjects.length}{' '}
                  {subjects.length === 1 ? 'subject' : 'subjects'}, organised
                  your way.
                </Text>
              </View>
            </View>
          )}
          {featuredSubject && (
            <AppButton
              title="Browse subjects"
              onPress={browseSubjects}
              variant="soft"
              icon={<ArrowRight size={19} color={colors.primary} />}
              className="mt-3"
            />
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

export default HomeScreen;
