import React from 'react';

import {
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';

import {
  BottomTabScreenProps,
} from '@react-navigation/bottom-tabs';

import {
  BookOpen,
  BrainCircuit,
  FilePlus2,
  LibraryBig,
  MessageCircleMore,
  Sparkles,
} from 'lucide-react-native';

import AccountMenu from '../../components/home/AccountMenu';
import HomeStatCard from '../../components/home/HomeStatCard';
import QuickActionCard from '../../components/home/QuickActionCard';

import {useAuth} from '../../hooks/useAuth';
import {useSubjects} from '../../hooks/useSubjects';

import {MainTabParamList} from '../../navigation/navigationTypes';

type Props =
  BottomTabScreenProps<
    MainTabParamList,
    'Home'
  >;

const HomeScreen = ({
  navigation,
}: Props) => {
  const {user} = useAuth();

  const {
    subjects,
  } = useSubjects();

  const displayName =
    user?.displayName?.trim() ||
    user?.email?.split('@')[0] ||
    'Student';

  const firstName =
    displayName.split(' ')[0];

  const subjectCount =
    subjects?.length ?? 0;

  /*
   * Materials are not implemented yet.
   *
   * Replace this with real material
   * data after the Materials module
   * is connected.
   */
  const materialCount = 0;

  return (
    <SafeAreaView
      className="
        flex-1
        bg-slate-50
      ">

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={
          false
        }>

        <View
          className="
            px-6
            pb-12
            pt-6
          ">

          {/* =============================================
              HEADER
          ============================================== */}

          <View
            className="
              mb-8
              flex-row
              items-center
              justify-between
            ">

            <View
              className="
                flex-1
                pr-4
              ">

              <Text
                className="
                  text-[27px]
                  font-bold
                  tracking-tight
                  text-slate-900
                ">
                Hi, {firstName} 👋
              </Text>

              <Text
                className="
                  mt-1
                  text-sm
                  leading-5
                  text-slate-500
                ">
                Ready to make some
                progress today?
              </Text>

            </View>

            <AccountMenu
              displayName={
                displayName
              }
            />

          </View>

          {/* =============================================
              HERO
          ============================================== */}

          <View
            className="
              relative
              mb-8
              min-h-[260px]
              overflow-hidden
              rounded-3xl
              bg-indigo-600
              p-6
            ">

            {/* Decorations */}

            <View
              className="
                absolute
                -right-9
                -top-8
                h-[130px]
                w-[130px]
                rounded-full
                bg-white/10
              "
            />

            <View
              className="
                absolute
                -bottom-11
                right-9
                h-[90px]
                w-[90px]
                rounded-full
                bg-white/10
              "
            />

            <View className="mb-6">

              <View
                className="
                  self-start
                  flex-row
                  items-center
                  rounded-full
                  bg-white/15
                  px-3
                  py-2
                ">

                <Sparkles
                  size={14}
                  color="#FFFFFF"
                />

                <Text
                  className="
                    ml-2
                    text-[11px]
                    font-bold
                    tracking-widest
                    text-white
                  ">
                  LEARNLOOP AI
                </Text>

              </View>

            </View>

            <Text
              className="
                max-w-[80%]
                text-3xl
                font-bold
                leading-9
                tracking-tight
                text-white
              ">
              Learn smarter,
              {'\n'}
              not harder.
            </Text>

            <Text
              className="
                mt-4
                max-w-[88%]
                text-sm
                leading-[21px]
                text-indigo-100
              ">
              Organize your materials
              and transform them into
              summaries, flashcards
              and quizzes.
            </Text>

            <Pressable
              accessibilityRole="button"
              onPress={() =>
                navigation.navigate(
                  'Subjects',
                )
              }
              className="
                mt-6
                self-start
                flex-row
                items-center
                rounded-xl
                bg-white
                px-4
                py-3
                active:opacity-80
              ">

              <BookOpen
                size={18}
                color="#4F46E5"
              />

              <Text
                className="
                  ml-2
                  text-sm
                  font-bold
                  text-indigo-600
                ">
                Explore subjects
              </Text>

            </Pressable>

          </View>

          {/* =============================================
              WORKSPACE
          ============================================== */}

          <View className="mb-4">

            <Text
              className="
                text-lg
                font-bold
                text-slate-900
              ">
              Your workspace
            </Text>

            <Text
              className="
                mt-1
                text-sm
                leading-[19px]
                text-slate-500
              ">
              Everything you're
              learning in one place.
            </Text>

          </View>

          <View
            className="
              mb-4
              flex-row
              gap-4
            ">

            <HomeStatCard
              value={subjectCount}
              label="Subjects"
              icon={LibraryBig}
              iconColor="#4F46E5"
              iconBackground="#EEF2FF"
            />

            <HomeStatCard
              value={materialCount}
              label="Materials"
              icon={BookOpen}
              iconColor="#0284C7"
              iconBackground="#E0F2FE"
            />

          </View>

          {/* =============================================
              SUBJECT BANNER
          ============================================== */}

          <Pressable
            accessibilityRole="button"
            onPress={() =>
              navigation.navigate(
                'Subjects',
              )
            }
            className="
              mb-8
              min-h-[82px]
              flex-row
              items-center
              rounded-[18px]
              border
              border-slate-200
              bg-white
              p-4
              active:scale-[0.99]
              active:opacity-80
            ">

            <View
              className="
                mr-4
                h-12
                w-12
                items-center
                justify-center
                rounded-2xl
                bg-indigo-50
              ">

              <LibraryBig
                size={24}
                color="#4F46E5"
              />

            </View>

            <View className="flex-1">

              <Text
                className="
                  text-base
                  font-bold
                  text-slate-900
                ">
                My Subjects
              </Text>

              <Text
                className="
                  mt-1
                  text-sm
                  text-slate-500
                ">
                Organize learning
                materials into
                subjects.
              </Text>

            </View>

            <View
              className="
                h-[30px]
                w-[30px]
                items-center
                justify-center
              ">

              <Text
                className="
                  text-[27px]
                  text-slate-400
                ">
                ›
              </Text>

            </View>

          </Pressable>

          {/* =============================================
              QUICK ACTIONS
          ============================================== */}

          <View className="mb-4">

            <Text
              className="
                text-lg
                font-bold
                text-slate-900
              ">
              Quick actions
            </Text>

          </View>

          <View
            className="
              mb-4
              flex-row
              flex-wrap
              justify-between
            ">

            <QuickActionCard
              title="Add subject"
              description="Create a new learning space"
              icon={FilePlus2}
              iconColor="#7C3AED"
              iconBackground="#F3E8FF"
              onPress={() =>
                navigation.navigate(
                  'Subjects',
                )
              }
            />

            <QuickActionCard
              title="Add material"
              description="Text, PDF, image or camera"
              icon={BookOpen}
              iconColor="#0284C7"
              iconBackground="#E0F2FE"
              onPress={() =>
                navigation.navigate(
                  'Subjects',
                )
              }
            />

            <QuickActionCard
              title="Study tools"
              description="Flashcards and quizzes"
              icon={BrainCircuit}
              iconColor="#16A34A"
              iconBackground="#DCFCE7"
              disabled
            />

            <QuickActionCard
              title="Ask AI"
              description="Chat with your material"
              icon={
                MessageCircleMore
              }
              iconColor="#D97706"
              iconBackground="#FEF3C7"
              disabled
            />

          </View>

          {/* =============================================
              COMING SOON
          ============================================== */}

          <View
            className="
              flex-row
              items-center
              rounded-[18px]
              border
              border-purple-200
              bg-purple-50
              p-4
            ">

            <View
              className="
                mr-4
                h-[46px]
                w-[46px]
                items-center
                justify-center
                rounded-2xl
                bg-purple-100
              ">

              <Sparkles
                size={22}
                color="#7C3AED"
              />

            </View>

            <View className="flex-1">

              <Text
                className="
                  text-sm
                  font-bold
                  text-slate-900
                ">
                AI study tools are
                coming next
              </Text>

              <Text
                className="
                  mt-1
                  text-xs
                  leading-[18px]
                  text-slate-500
                ">
                Add materials to
                generate summaries,
                flashcards and
                quizzes.
              </Text>

            </View>

          </View>

        </View>

      </ScrollView>

    </SafeAreaView>
  );
};

export default HomeScreen;