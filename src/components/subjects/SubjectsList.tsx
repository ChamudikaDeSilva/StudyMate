import React from 'react';

import { View } from 'react-native';

import { BookOpen, RefreshCw, Search } from 'lucide-react-native';

import { Subject } from '../../domain/models/Subject';

import { subjectPalette } from '../../constants/subjectPalette';
import { colors } from '../../constants/colors';

import ScreenState from '../common/ScreenState';

import SubjectCard from './SubjectCard';

interface SubjectsListProps {
  subjects: Subject[];

  loading: boolean;

  showLoadError: boolean;

  searchText: string;

  onRetry: () => Promise<void>;

  onOpenSubject: (subject: Subject) => void;

  onOptionsPress: (subject: Subject) => void;

  isSubjectBusy: (subjectId: string) => boolean;
}

const SubjectsList = ({
  subjects,

  loading,

  showLoadError,

  searchText,

  onRetry,

  onOpenSubject,

  onOptionsPress,

  isSubjectBusy,
}: SubjectsListProps) => {
  if (loading) {
    return (
      <ScreenState
        loading
        title="Loading your subjects"
        description="Preparing your learning library..."
      />
    );
  }

  if (showLoadError) {
    return (
      <ScreenState
        title="Couldn't load subjects"
        description="Check your connection and try again."
        icon={RefreshCw}
        iconColor={colors.danger}
        actionTitle="Try again"
        onAction={onRetry}
      />
    );
  }

  if (subjects.length === 0) {
    const hasSearch = searchText.trim().length > 0;

    return (
      <ScreenState
        title={hasSearch ? 'No subjects found' : 'Create your first subject'}
        description={
          hasSearch
            ? `We couldn't find anything matching ` + `"${searchText.trim()}".`
            : 'Subjects help you organize notes, ' +
              'PDFs, images and other learning materials.'
        }
        icon={hasSearch ? Search : BookOpen}
      />
    );
  }

  return (
    <View>
      {subjects.map((subject, index) => (
        <SubjectCard
          key={subject.id}
          subject={subject}
          accent={subjectPalette[index % subjectPalette.length]}
          busy={isSubjectBusy(subject.id)}
          onPress={() => onOpenSubject(subject)}
          onOptionsPress={onOptionsPress}
        />
      ))}
    </View>
  );
};

export default SubjectsList;
