import React from 'react';

import {
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

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

import {MainStackParamList} from '../../navigation/navigationTypes';

import {homeStyles as styles} from './styles/homeStyles';

type Props = NativeStackScreenProps<
  MainStackParamList,
  'Home'
>;

const HomeScreen = ({navigation}: Props) => {
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
   * We will replace this with real repository data later.
   */
  const materialCount = 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>

        {/* ===================================================
            HEADER
        ==================================================== */}

        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.greeting}>
              Hi, {firstName} 👋
            </Text>

            <Text style={styles.subtitle}>
              Ready to make some progress today?
            </Text>
          </View>

          <AccountMenu
            displayName={displayName}
          />
        </View>

        {/* ===================================================
            AI HERO
        ==================================================== */}

        <View style={styles.heroCard}>

          <View style={styles.heroTopRow}>
            <View style={styles.aiBadge}>
              <Sparkles
                size={14}
                color="#FFFFFF"
              />

              <Text style={styles.aiBadgeText}>
                LEARNLOOP AI
              </Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>
            Learn smarter,
            {'\n'}
            not harder.
          </Text>

          <Text style={styles.heroDescription}>
            Organize your materials and transform them
            into summaries, flashcards and quizzes.
          </Text>

          <Pressable
            accessibilityRole="button"
            onPress={() =>
              navigation.navigate('Subjects')
            }
            style={({pressed}) => [
              styles.heroButton,
              pressed && styles.heroButtonPressed,
            ]}>

            <BookOpen
              size={18}
              color="#4F46E5"
            />

            <Text style={styles.heroButtonText}>
              Explore subjects
            </Text>

          </Pressable>

          <View style={styles.heroDecorationOne} />
          <View style={styles.heroDecorationTwo} />

        </View>

        {/* ===================================================
            OVERVIEW
        ==================================================== */}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Your workspace
            </Text>

            <Text style={styles.sectionSubtitle}>
              Everything you're learning in one place.
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
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

        {/* ===================================================
            SUBJECTS
        ==================================================== */}

        <Pressable
          accessibilityRole="button"
          onPress={() =>
            navigation.navigate('Subjects')
          }
          style={({pressed}) => [
            styles.subjectBanner,
            pressed && styles.cardPressed,
          ]}>

          <View style={styles.subjectBannerIcon}>
            <LibraryBig
              size={24}
              color="#4F46E5"
            />
          </View>

          <View style={styles.subjectBannerContent}>
            <Text style={styles.subjectBannerTitle}>
              My Subjects
            </Text>

            <Text style={styles.subjectBannerDescription}>
              Organize learning materials into subjects.
            </Text>
          </View>

          <View style={styles.subjectArrow}>
            <Text style={styles.subjectArrowText}>
              ›
            </Text>
          </View>

        </Pressable>

        {/* ===================================================
            QUICK ACTIONS
        ==================================================== */}

        <View style={styles.quickHeader}>
          <Text style={styles.sectionTitle}>
            Quick actions
          </Text>
        </View>

        <View style={styles.quickGrid}>

          <QuickActionCard
            title="Add subject"
            description="Create a new learning space"
            icon={FilePlus2}
            iconColor="#7C3AED"
            iconBackground="#F3E8FF"
            onPress={() =>
              navigation.navigate('Subjects')
            }
          />

          <QuickActionCard
            title="Add material"
            description="Text, PDF, image or camera"
            icon={BookOpen}
            iconColor="#0284C7"
            iconBackground="#E0F2FE"
            onPress={() =>
              navigation.navigate('Subjects')
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
            icon={MessageCircleMore}
            iconColor="#D97706"
            iconBackground="#FEF3C7"
            disabled
          />

        </View>

        {/* ===================================================
            COMING NEXT
        ==================================================== */}

        <View style={styles.comingSoonCard}>
          <View style={styles.comingSoonIcon}>
            <Sparkles
              size={22}
              color="#7C3AED"
            />
          </View>

          <View style={styles.comingSoonContent}>
            <Text style={styles.comingSoonTitle}>
              AI study tools are coming next
            </Text>

            <Text style={styles.comingSoonDescription}>
              Add materials to generate summaries,
              flashcards and quizzes.
            </Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;