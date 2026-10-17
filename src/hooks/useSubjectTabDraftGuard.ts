import { useCallback, useEffect } from 'react';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList, SubjectsStackParamList } from '../navigation/navigationTypes';

type Navigation = Pick<NativeStackNavigationProp<SubjectsStackParamList>, 'getParent'>;

/** Keep an unfinished material form when switching away from its tab. */
export const useSubjectTabDraftGuard = (navigation: Navigation, hasDraft: boolean) => {
  useFocusEffect(useCallback(() => {
    const tabs = navigation.getParent<BottomTabNavigationProp<MainTabParamList>>();
    tabs?.setOptions({ popToTopOnBlur: !hasDraft });
    return tabs?.addListener('tabPress', event => {
      if (hasDraft) {
        event.preventDefault();
      }
    });
  }, [navigation, hasDraft]));

  // Do not restore this option on blur: it protects the outgoing transition.
  useEffect(() => () => {
    navigation.getParent<BottomTabNavigationProp<MainTabParamList>>()
      ?.setOptions({ popToTopOnBlur: true });
  }, [navigation]);
};
