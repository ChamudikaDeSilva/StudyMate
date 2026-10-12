import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { ArrowRight, LibraryBig, Mail } from 'lucide-react-native';
import ScreenContainer from '../../components/common/ScreenContainer';
import ScreenHeader from '../../components/common/ScreenHeader';
import SectionCard from '../../components/common/SectionCard';
import AppButton from '../../components/common/AppButton';
import AccountMenu from '../../components/home/AccountMenu';
import { colors } from '../../constants/colors';
import { useAuth } from '../../hooks/useAuth';
import { MainTabParamList } from '../../navigation/navigationTypes';
import { getDisplayName, getInitials } from '../../utils/userUtils';
type Props = BottomTabScreenProps<MainTabParamList, 'Profile'>;
const ProfileScreen = ({ navigation }: Props) => {
  const { user } = useAuth();
  const displayName = getDisplayName(user);
  return (
    <ScreenContainer>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="w-full max-w-[640px] self-center px-6 pb-8 pt-6">
          <ScreenHeader
            eyebrow="YOUR ACCOUNT"
            title="Profile"
            subtitle="A space that’s yours."
            right={
              <AccountMenu
                displayName={displayName}
                onProfile={() => navigation.navigate('Profile')}
              />
            }
          />
          <SectionCard
            className="items-center overflow-hidden py-8"
            style={{
              backgroundColor: colors.primary,
              borderColor: colors.primary,
            }}
          >
            <View
              pointerEvents="none"
              className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/10"
            />
            <View
              pointerEvents="none"
              className="absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-white/10"
            />
            <View className="h-20 w-20 items-center justify-center rounded-[26px] border border-white/25 bg-white/20">
              <Text className="text-3xl font-bold text-white">
                {getInitials(displayName)}
              </Text>
            </View>
            <Text className="mt-5 text-center text-2xl font-bold tracking-tight text-white">
              {displayName}
            </Text>
            <Text className="mt-2 text-center text-sm text-brand-100">
              Your personal learning space
            </Text>
          </SectionCard>
          {!!user?.email && (
            <SectionCard label="ACCOUNT DETAILS" className="mt-5">
              <View className="flex-row items-center">
                <View className="mr-3 h-11 w-11 items-center justify-center rounded-2xl bg-brand-50">
                  <Mail size={20} color={colors.primary} />
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-muted">Email address</Text>
                  <Text
                    selectable
                    className="mt-1 text-sm font-semibold text-ink"
                  >
                    {user.email}
                  </Text>
                </View>
              </View>
            </SectionCard>
          )}
          <SectionCard label="YOUR WORKSPACE" className="mt-5">
            <View className="mb-3 h-11 w-11 items-center justify-center rounded-2xl bg-brand-50">
              <LibraryBig size={22} color={colors.primary} />
            </View>
            <Text className="text-lg font-bold text-ink">
              Keep your learning together
            </Text>
            <Text className="mb-5 mt-2 text-sm leading-[22px] text-muted">
              Your subjects bring notes, materials and study tools into one
              place. Pick one to continue.
            </Text>
            <AppButton
              title="Open my subjects"
              onPress={() =>
                navigation.navigate('Subjects', { screen: 'SubjectsHome' })
              }
              variant="soft"
              icon={<ArrowRight size={19} color={colors.primary} />}
            />
          </SectionCard>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};
export default ProfileScreen;
