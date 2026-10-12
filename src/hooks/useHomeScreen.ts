import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getDisplayName, getFirstName } from '../utils/userUtils';
import { useAuth } from './useAuth';
import { useSubjects } from './useSubjects';

export const useHomeScreen = () => {
  const { user } = useAuth();
  const { subjects, loading, error, loadSubjects } = useSubjects();
  const [refreshing, setRefreshing] = useState(false);
  const loadSubjectsRef = useRef(loadSubjects);
  const refreshInProgress = useRef(false);
  const hasFocused = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    loadSubjectsRef.current = loadSubjects;
  }, [loadSubjects]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const refreshSubjects = useCallback(async () => {
    if (refreshInProgress.current) {
      return;
    }

    refreshInProgress.current = true;
    setRefreshing(true);
    try {
      await loadSubjectsRef.current();
    } finally {
      refreshInProgress.current = false;
      if (mounted.current) {
        setRefreshing(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      // useSubjects loads on mount; refresh when returning from another tab.
      if (hasFocused.current) {
        refreshSubjects();
      } else {
        hasFocused.current = true;
      }
    }, [refreshSubjects]),
  );

  const recentSubjects = useMemo(
    () => [...subjects].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 3),
    [subjects],
  );

  return {
    displayName: getDisplayName(user),
    firstName: getFirstName(user),
    subjects,
    recentSubjects,
    loading,
    refreshing,
    error,
    showLoadError: !loading && !!error && subjects.length === 0,
    refreshSubjects,
  };
};
