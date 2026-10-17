import React, { useCallback } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import {
  BottomTabNavigationOptions,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import { RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { InnerScreen, ScreenContext } from 'react-native-screens';
import { BookOpen, Home, LucideIcon, UserRound } from 'lucide-react-native';
import { colors } from '../constants/colors';
import HomeScreen from '../screens/home/HomeScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import SubjectsNavigator from './SubjectsNavigator';
import { MainTabParamList } from './navigationTypes';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Android tabs omit the native status bar style. Give them readable defaults
// while allowing nested previews to override them. iOS uses the focused RN bar.
const ThemedNativeScreen = React.forwardRef<
  React.ComponentRef<typeof InnerScreen>,
  React.ComponentProps<typeof InnerScreen>
>((props, ref) => (
  <InnerScreen
    {...props}
    ref={ref}
    statusBarStyle={
      props.statusBarStyle ?? (Platform.OS === 'android' ? 'dark' : undefined)
    }
  />
));
ThemedNativeScreen.displayName = 'ThemedNativeScreen';
const tabIcons: Record<keyof MainTabParamList, LucideIcon> = {
  Home,
  Subjects: BookOpen,
  Profile: UserRound,
};
type ScreenOptionsProps = {
  route: RouteProp<MainTabParamList, keyof MainTabParamList>;
};

const getScreenOptions = (
  { route }: ScreenOptionsProps,
  bottomInset: number,
): BottomTabNavigationOptions => {
  const Icon = tabIcons[route.name];

  return {
    headerShown: false,
    sceneStyle: styles.scene,
    tabBarHideOnKeyboard: true,
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.textMuted,
    tabBarLabelStyle: styles.label,
    tabBarStyle: [
      styles.tabBar,
      { height: 64 + bottomInset, paddingBottom: Math.max(8, bottomInset) },
    ],
    tabBarIcon: ({ focused, color }) => (
      <View
        className={`h-8 w-12 items-center justify-center rounded-[13px] ${
          focused ? 'bg-brand-50' : 'bg-transparent'
        }`}
      >
        <Icon size={20} color={color} strokeWidth={focused ? 2.5 : 2} />
      </View>
    ),
  };
};

const MainNavigator = () => {
  const { bottom } = useSafeAreaInsets();
  const screenOptions = useCallback(
    (props: ScreenOptionsProps) => getScreenOptions(props, bottom),
    [bottom],
  );

  return (
    <ScreenContext.Provider value={ThemedNativeScreen}>
      <Tab.Navigator screenOptions={screenOptions}>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen
          name="Subjects"
          component={SubjectsNavigator}
          options={{ popToTopOnBlur: true }}
        />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </ScreenContext.Provider>
  );
};

const styles = StyleSheet.create({
  scene: { backgroundColor: colors.background },
  label: { fontSize: 11, lineHeight: 14, fontWeight: '700', marginTop: 3 },
  tabBar: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    backgroundColor: colors.surface,
    elevation: 8,
    shadowColor: colors.primaryPressed,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
  },
});

export default MainNavigator;
