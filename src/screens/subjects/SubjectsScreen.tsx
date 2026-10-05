import React from 'react';

import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';

import {
  BookOpen,
} from 'lucide-react-native';

import {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import BottomActionBar
  from '../../components/common/BottomActionBar';

import OverviewCard
  from '../../components/common/OverviewCard';

import ScreenHeader
  from '../../components/common/ScreenHeader';

import SearchBar
  from '../../components/common/SearchBar';

import AccountMenu
  from '../../components/home/AccountMenu';

import SubjectActionsSheet
  from '../../components/subjects/SubjectActionsSheet';

import SubjectFormModal
  from '../../components/subjects/SubjectFormModal';

import SubjectsList
  from '../../components/subjects/SubjectsList';

import {
  SubjectsStackParamList,
} from '../../navigation/navigationTypes';

import {
  useSubjectsScreen,
} from '../../hooks/useSubjectsScreen';


type Props =
  NativeStackScreenProps<
    SubjectsStackParamList,
    'SubjectsHome'
  >;


const SubjectsScreen = ({
  navigation,
}: Props) => {

  const screen =
    useSubjectsScreen();


  return (
    <SafeAreaView
      className="
        flex-1
        bg-slate-50
      ">

      <View
        className="
          flex-1
        ">

        {/* ===================================================
            PAGE CONTENT
        ==================================================== */}

        <ScrollView
          className="
            flex-1
          "

          showsVerticalScrollIndicator={
            false
          }

          keyboardShouldPersistTaps="handled">

          <View
            className="
              px-6
              pb-6
              pt-6
            ">

            {/* Header */}

            <ScreenHeader
              title="Subjects"

              subtitle="Organize everything you're learning."

              right={
                <AccountMenu
                  displayName={
                    screen.displayName
                  }
                />
              }
            />


            {/* Overview */}

            <View
              className="
                mb-6
              ">

              <OverviewCard
                kicker="YOUR LEARNING LIBRARY"

                value={
                  screen.subjects.length
                }

                description={
                  screen.subjects.length ===
                  1
                    ? 'subject ready for your learning materials'
                    : 'subjects ready for your learning materials'
                }

                icon={
                  BookOpen
                }
              />

            </View>


            {/* Search */}

            <View
              className="
                mb-8
              ">

              <SearchBar
                value={
                  screen.searchText
                }

                onChangeText={
                  screen.setSearchText
                }

                placeholder="Search your subjects..."
              />

            </View>


            {/* Section heading */}

            <View
              className="
                mb-4
                flex-row
                items-center
              ">

              <Text
                className="
                  text-lg
                  font-bold
                  text-slate-900
                ">

                Your subjects

              </Text>


              {!screen.loading && (

                <View
                  className="
                    ml-2
                    min-w-[28px]
                    items-center
                    rounded-full
                    bg-indigo-50
                    px-2
                    py-1
                  ">

                  <Text
                    className="
                      text-xs
                      font-bold
                      text-indigo-600
                    ">

                    {
                      screen
                        .filteredSubjects
                        .length
                    }

                  </Text>

                </View>

              )}

            </View>


            {/* Subject list */}

            <SubjectsList
              subjects={
                screen.filteredSubjects
              }

              loading={
                screen.loading
              }

              showLoadError={
                screen.showLoadError
              }

              searchText={
                screen.searchText
              }

              onRetry={
                screen.loadSubjects
              }

              isSubjectBusy={
                screen.isSubjectBusy
              }

              onOptionsPress={
                screen.openActions
              }

              onOpenSubject={
                subject => {

                  navigation.navigate(
                    'SubjectMaterials',

                    {
                      subjectId:
                        subject.id,

                      subjectName:
                        subject.name,
                    },
                  );
                }
              }
            />

          </View>

        </ScrollView>


        {/* ===================================================
            PRIMARY ACTION
        ==================================================== */}

        <BottomActionBar
          title="Add subject"

          onPress={
            screen.openCreateSubject
          }
        />

      </View>


      {/* =====================================================
          SUBJECT ACTIONS
      ====================================================== */}

      <SubjectActionsSheet
        visible={
          screen.actionsVisible
        }

        subject={
          screen.selectedSubject
        }

        onClose={
          screen.closeActions
        }

        onEdit={
          screen.openEdit
        }

        onDelete={
          screen.confirmDelete
        }
      />


      {/* =====================================================
          CREATE / EDIT MODAL
      ====================================================== */}

      <SubjectFormModal
        visible={
          screen.formVisible
        }

        editing={
          screen.editingSubject !==
          null
        }

        name={
          screen.name
        }

        description={
          screen.description
        }

        submitting={
          screen.submitting
        }

        onNameChange={
          screen.setName
        }

        onDescriptionChange={
          screen.setDescription
        }

        onClose={
          screen.closeForm
        }

        onSave={
          screen.saveSubject
        }
      />

    </SafeAreaView>
  );
};


export default SubjectsScreen;