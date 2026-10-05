import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  useFocusEffect,
} from '@react-navigation/native';

import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';

import {
  BookOpen,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  RefreshCw,
  Search,
  Type,
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

import ScreenState
  from '../../components/common/ScreenState';

import SearchBar
  from '../../components/common/SearchBar';

import MaterialCard
  from '../../components/materials/MaterialCard';

import MaterialFilterChip
  from '../../components/materials/MaterialFilterChip';

import {
  useMaterials,
} from '../../hooks/useMaterials';

import {
  SubjectsStackParamList,
} from '../../navigation/navigationTypes';


type Props =
  NativeStackScreenProps<
    SubjectsStackParamList,
    'SubjectMaterials'
  >;


type MaterialFilter =
  | 'all'
  | 'text'
  | 'pdf'
  | 'image';


const SubjectMaterialsScreen = ({
  navigation,
  route,
}: Props) => {

  const {
    subjectId,
    subjectName,
  } = route.params;


  const {
    materials,
    loading,
    error,
    loadMaterials,
  } = useMaterials(
    subjectId,
  );


  const [
    searchText,
    setSearchText,
  ] = useState(
    '',
  );


  const [
    activeFilter,
    setActiveFilter,
  ] = useState<
    MaterialFilter
  >(
    'all',
  );


  const hasFocusedOnce =
    useRef(
      false,
    );


  useFocusEffect(
    useCallback(
      () => {

        if (
          hasFocusedOnce.current
        ) {

          void loadMaterials();

        } else {

          hasFocusedOnce.current =
            true;
        }

      },
      [
        loadMaterials,
      ],
    ),
  );


  // =========================================================
  // FILTERING
  // =========================================================

  const filteredMaterials =
    useMemo(
      () => {

        const query =
          searchText
            .trim()
            .toLowerCase();


        return materials.filter(
          material => {

            const sourceMatches =

              activeFilter ===
                'all'

              ||

              (
                activeFilter ===
                  'image'

                  ? (
                      material.sourceType ===
                        'image'

                      ||

                      material.sourceType ===
                        'camera'
                    )

                  : material.sourceType ===
                    activeFilter
              );


            if (!sourceMatches) {

              return false;
            }


            if (!query) {

              return true;
            }


            return (

              material.title
                .toLowerCase()
                .includes(
                  query,
                )

              ||

              (
                material.content
                  ?.toLowerCase()
                  .includes(
                    query,
                  )
                ??
                false
              )

              ||

              (
                material.fileName
                  ?.toLowerCase()
                  .includes(
                    query,
                  )
                ??
                false
              )
            );
          },
        );

      },
      [
        materials,
        searchText,
        activeFilter,
      ],
    );


  const showLoadError =

    !loading

    &&

    !!error

    &&

    materials.length === 0;


  const hasSearch =
    searchText
      .trim()
      .length >
    0;


  const hasActiveFilter =
    activeFilter !==
    'all';


  const openAddMaterial =
    () => {

      navigation.navigate(
        'AddMaterial',

        {
          subjectId,
          subjectName,
        },
      );
    };


  // =========================================================
  // EMPTY STATE
  // =========================================================

  const emptyTitle =

    hasSearch
      ? 'No materials found'

      : activeFilter ===
          'text'
        ? 'No text materials yet'

        : activeFilter ===
            'pdf'
          ? 'No PDF materials yet'

          : activeFilter ===
              'image'
            ? 'No image materials yet'

            : 'Add your first material';


  const emptyDescription =

    hasSearch
      ? `We couldn't find anything matching "${searchText.trim()}".`

      : activeFilter ===
          'text'
        ? 'This subject does not have any text materials yet.'

        : activeFilter ===
            'pdf'
          ? 'This subject does not have any PDF materials yet.'

          : activeFilter ===
              'image'
            ? 'This subject does not have any image or camera materials yet.'

            : 'Add text notes, PDFs, gallery images or camera captures.';


  // =========================================================
  // UI
  // =========================================================

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

            <ScreenHeader
              title={
                subjectName
              }

              subtitle="Learning materials"

              onBack={() =>
                navigation.goBack()
              }
            />


            <View
              className="
                mb-6
              ">

              <OverviewCard
                kicker="MATERIALS"

                value={
                  materials.length
                }

                description={
                  materials.length === 1
                    ? 'material saved in this subject'
                    : 'materials saved in this subject'
                }

                icon={
                  BookOpen
                }
              />

            </View>


            <View
              className="
                mb-4
              ">

              <SearchBar
                value={
                  searchText
                }

                onChangeText={
                  setSearchText
                }

                placeholder="Search materials..."
              />

            </View>


            <ScrollView
              horizontal

              showsHorizontalScrollIndicator={
                false
              }

              className="
                mb-8
              ">

              <MaterialFilterChip
                label="All"

                selected={
                  activeFilter ===
                  'all'
                }

                icon={
                  CheckCircle2
                }

                color="#4F46E5"

                background="#EEF2FF"

                onPress={() =>
                  setActiveFilter(
                    'all',
                  )
                }
              />


              <MaterialFilterChip
                label="Text"

                selected={
                  activeFilter ===
                  'text'
                }

                icon={
                  Type
                }

                color="#4F46E5"

                background="#EEF2FF"

                onPress={() =>
                  setActiveFilter(
                    'text',
                  )
                }
              />


              <MaterialFilterChip
                label="PDF"

                selected={
                  activeFilter ===
                  'pdf'
                }

                icon={
                  FileText
                }

                color="#E11D48"

                background="#FFF1F2"

                onPress={() =>
                  setActiveFilter(
                    'pdf',
                  )
                }
              />


              <MaterialFilterChip
                label="Image"

                selected={
                  activeFilter ===
                  'image'
                }

                icon={
                  ImageIcon
                }

                color="#0284C7"

                background="#E0F2FE"

                onPress={() =>
                  setActiveFilter(
                    'image',
                  )
                }
              />

            </ScrollView>


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

                Your materials

              </Text>


              {!loading && (

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
                      filteredMaterials.length
                    }

                  </Text>

                </View>

              )}

            </View>


            {loading ? (

              <ScreenState
                loading

                title="Loading materials"

                description="Preparing your study materials..."
              />

            ) : showLoadError ? (

              <ScreenState
                title="Couldn't load materials"

                description="Check your connection and try again."

                icon={
                  RefreshCw
                }

                iconColor="#DC2626"

                actionTitle="Try again"

                onAction={
                  loadMaterials
                }
              />

            ) : filteredMaterials.length ===
              0 ? (

              <ScreenState
                title={
                  emptyTitle
                }

                description={
                  emptyDescription
                }

                icon={
                  hasSearch ||
                  hasActiveFilter
                    ? Search
                    : BookOpen
                }
              />

            ) : (

              <View>

                {filteredMaterials.map(
                  material => (

                    <MaterialCard
                      key={
                        material.id
                      }

                      material={
                        material
                      }

                      onPress={() =>

                        navigation.navigate(
                          'MaterialDetails',

                          {
                            materialId:
                              material.id,

                            subjectId,

                            subjectName,
                          },
                        )
                      }
                    />

                  ),
                )}

              </View>

            )}

          </View>

        </ScrollView>


        <BottomActionBar
          title="Add material"

          onPress={
            openAddMaterial
          }
        />

      </View>

    </SafeAreaView>
  );
};


export default SubjectMaterialsScreen;