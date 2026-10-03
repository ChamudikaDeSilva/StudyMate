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
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  FileText,
  Plus,
  RefreshCw,
  Search,
  Type,
  X,
} from 'lucide-react-native';

import {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import MaterialCard from '../../components/materials/MaterialCard';

import {useMaterials} from '../../hooks/useMaterials';

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
  | 'pdf';

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
  ] = useState('');

  const [
    activeFilter,
    setActiveFilter,
  ] = useState<MaterialFilter>(
    'all',
  );

  /*
   * useMaterials() already loads the
   * materials when this screen mounts.
   *
   * We therefore skip the first focus
   * event and refresh only when the user
   * returns to this screen later.
   *
   * Example:
   *
   * SubjectMaterials
   *      ↓
   * AddMaterial
   *      ↓
   * Save
   *      ↓
   * goBack()
   *      ↓
   * loadMaterials()
   */
  const hasFocusedOnce =
    useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (
        hasFocusedOnce.current
      ) {
        loadMaterials();
      } else {
        hasFocusedOnce.current =
          true;
      }
    }, [loadMaterials]),
  );

  // =========================================================
  // Filter + Search
  // =========================================================

  const filteredMaterials =
    useMemo(() => {
      const query =
        searchText
          .trim()
          .toLowerCase();

      return materials.filter(
        material => {
          const sourceMatches =
            activeFilter ===
              'all' ||
            material.sourceType ===
              activeFilter;

          if (!sourceMatches) {
            return false;
          }

          if (!query) {
            return true;
          }

          const titleMatches =
            material.title
              .toLowerCase()
              .includes(query);

          const contentMatches =
            material.content
              ?.toLowerCase()
              .includes(query) ??
            false;

          const fileMatches =
            material.fileName
              ?.toLowerCase()
              .includes(query) ??
            false;

          return (
            titleMatches ||
            contentMatches ||
            fileMatches
          );
        },
      );
    }, [
      materials,
      searchText,
      activeFilter,
    ]);

  const showLoadError =
    !loading &&
    !!error &&
    materials.length === 0;

  const hasSearch =
    searchText.trim().length > 0;

  const hasActiveFilter =
    activeFilter !== 'all';

  // =========================================================
  // Navigation helpers
  // =========================================================

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

  const openMaterialDetails = (
    materialId: string,
  ) => {
    navigation.navigate(
      'MaterialDetails',
      {
        materialId,
        subjectId,
        subjectName,
      },
    );
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <SafeAreaView
      className="
        flex-1
        bg-slate-50
      ">

      <View className="flex-1">

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled">

          <View
            className="
              px-6
              pb-28
              pt-6
            ">

            {/* ==========================================
                HEADER
            =========================================== */}

            <View
              className="
                mb-8
                flex-row
                items-center
              ">

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Go back"
                onPress={() =>
                  navigation.goBack()
                }
                className="
                  mr-4
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  active:opacity-70
                ">

                <ArrowLeft
                  size={22}
                  color="#0F172A"
                />

              </Pressable>

              <View className="flex-1">

                <Text
                  className="
                    text-[26px]
                    font-bold
                    tracking-tight
                    text-slate-900
                  "
                  numberOfLines={1}>
                  {subjectName}
                </Text>

                <Text
                  className="
                    mt-1
                    text-sm
                    text-slate-500
                  ">
                  Learning materials
                </Text>

              </View>

            </View>

            {/* ==========================================
                OVERVIEW
            =========================================== */}

            <View
              className="
                relative
                mb-6
                min-h-[145px]
                flex-row
                items-center
                overflow-hidden
                rounded-[22px]
                bg-indigo-600
                p-6
              ">

              {/* Decoration */}

              <View
                className="
                  absolute
                  -right-8
                  -top-10
                  h-[120px]
                  w-[120px]
                  rounded-full
                  bg-white/10
                "
              />

              <View
                className="
                  absolute
                  -bottom-10
                  right-8
                  h-[80px]
                  w-[80px]
                  rounded-full
                  bg-white/10
                "
              />

              {/* Icon */}

              <View
                className="
                  z-10
                  mr-4
                  h-[54px]
                  w-[54px]
                  items-center
                  justify-center
                  rounded-2xl
                  bg-white/15
                ">

                <BookOpen
                  size={24}
                  color="#FFFFFF"
                />

              </View>

              {/* Count */}

              <View
                className="
                  z-10
                  flex-1
                ">

                <Text
                  className="
                    text-[10px]
                    font-bold
                    tracking-widest
                    text-indigo-200
                  ">
                  MATERIALS
                </Text>

                <Text
                  className="
                    mt-1
                    text-[32px]
                    font-extrabold
                    text-white
                  ">
                  {materials.length}
                </Text>

                <Text
                  className="
                    mt-1
                    text-xs
                    leading-[17px]
                    text-indigo-100
                  ">

                  {materials.length ===
                  1
                    ? 'material saved in this subject'
                    : 'materials saved in this subject'}

                </Text>

              </View>

            </View>

            {/* ==========================================
                SEARCH
            =========================================== */}

            <View
              className="
                mb-4
                h-[54px]
                flex-row
                items-center
                rounded-2xl
                border
                border-slate-200
                bg-white
                px-4
              ">

              <Search
                size={20}
                color="#64748B"
              />

              <TextInput
                className="
                  ml-2
                  flex-1
                  py-0
                  text-sm
                  text-slate-900
                "
                placeholder="Search materials..."
                placeholderTextColor="#94A3B8"
                value={
                  searchText
                }
                onChangeText={
                  setSearchText
                }
                returnKeyType="search"
              />

              {searchText.length >
                0 && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Clear search"
                  hitSlop={10}
                  onPress={() =>
                    setSearchText('')
                  }
                  className="
                    h-[30px]
                    w-[30px]
                    items-center
                    justify-center
                    rounded-full
                    bg-slate-100
                    active:opacity-70
                  ">

                  <X
                    size={17}
                    color="#64748B"
                  />

                </Pressable>
              )}

            </View>

            {/* ==========================================
                FILTERS
            =========================================== */}

            <View
              className="
                mb-8
                flex-row
                flex-wrap
              ">

              {/* All */}

              <Pressable
                accessibilityRole="button"
                accessibilityState={{
                  selected:
                    activeFilter === 'all',
                }}
                onPress={() =>
                  setActiveFilter(
                    'all',
                  )
                }
                className="
                  mr-2
                  flex-row
                  items-center
                  rounded-full
                  border
                  px-4
                  py-2
                "
                style={({pressed}) => ({
                  backgroundColor:
                    activeFilter ===
                    'all'
                      ? '#EEF2FF'
                      : '#FFFFFF',

                  borderColor:
                    activeFilter ===
                    'all'
                      ? '#4F46E5'
                      : '#E2E8F0',

                  opacity:
                    pressed
                      ? 0.78
                      : 1,
                })}>

                {activeFilter ===
                  'all' && (
                  <CheckCircle2
                    size={15}
                    color="#4F46E5"
                  />
                )}

                <Text
                  className="
                    text-sm
                    font-semibold
                  "
                  style={{
                    marginLeft:
                      activeFilter ===
                      'all'
                        ? 6
                        : 0,

                    color:
                      activeFilter ===
                      'all'
                        ? '#4338CA'
                        : '#475569',
                  }}>
                  All
                </Text>

              </Pressable>


              {/* Text */}

              <Pressable
                accessibilityRole="button"
                accessibilityState={{
                  selected:
                    activeFilter ===
                    'text',
                }}
                onPress={() =>
                  setActiveFilter(
                    'text',
                  )
                }
                className="
                  mr-2
                  flex-row
                  items-center
                  rounded-full
                  border
                  px-4
                  py-2
                "
                style={({pressed}) => ({
                  backgroundColor:
                    activeFilter ===
                    'text'
                      ? '#EEF2FF'
                      : '#FFFFFF',

                  borderColor:
                    activeFilter ===
                    'text'
                      ? '#4F46E5'
                      : '#E2E8F0',

                  opacity:
                    pressed
                      ? 0.78
                      : 1,
                })}>

                <Type
                  size={15}
                  color={
                    activeFilter ===
                    'text'
                      ? '#4F46E5'
                      : '#64748B'
                  }
                />

                <Text
                  className="
                    ml-2
                    text-sm
                    font-semibold
                  "
                  style={{
                    color:
                      activeFilter ===
                      'text'
                        ? '#4338CA'
                        : '#475569',
                  }}>
                  Text
                </Text>

              </Pressable>


              {/* PDF */}

              <Pressable
                accessibilityRole="button"
                accessibilityState={{
                  selected:
                    activeFilter ===
                    'pdf',
                }}
                onPress={() =>
                  setActiveFilter(
                    'pdf',
                  )
                }
                className="
                  flex-row
                  items-center
                  rounded-full
                  border
                  px-4
                  py-2
                "
                style={({pressed}) => ({
                  backgroundColor:
                    activeFilter ===
                    'pdf'
                      ? '#FFF1F2'
                      : '#FFFFFF',

                  borderColor:
                    activeFilter ===
                    'pdf'
                      ? '#E11D48'
                      : '#E2E8F0',

                  opacity:
                    pressed
                      ? 0.78
                      : 1,
                })}>

                <FileText
                  size={15}
                  color={
                    activeFilter ===
                    'pdf'
                      ? '#E11D48'
                      : '#64748B'
                  }
                />

                <Text
                  className="
                    ml-2
                    text-sm
                    font-semibold
                  "
                  style={{
                    color:
                      activeFilter ===
                      'pdf'
                        ? '#BE123C'
                        : '#475569',
                  }}>
                  PDF
                </Text>

              </Pressable>

            </View>

            {/* ==========================================
                SECTION HEADER
            =========================================== */}

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
                    justify-center
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

            {/* ==========================================
                LOADING
            =========================================== */}

            {loading ? (
              <View
                className="
                  min-h-[270px]
                  items-center
                  justify-center
                ">

                <View
                  className="
                    mb-4
                    h-[54px]
                    w-[54px]
                    items-center
                    justify-center
                    rounded-[17px]
                    bg-indigo-50
                  ">

                  <ActivityIndicator
                    size="small"
                    color="#4F46E5"
                  />

                </View>

                <Text
                  className="
                    text-lg
                    font-bold
                    text-slate-900
                  ">
                  Loading materials
                </Text>

                <Text
                  className="
                    mt-2
                    text-center
                    text-sm
                    text-slate-500
                  ">
                  Preparing your study
                  materials...
                </Text>

              </View>
            ) : showLoadError ? (

              /* ========================================
                  LOAD ERROR
              ========================================= */

              <View
                className="
                  min-h-[270px]
                  items-center
                  justify-center
                ">

                <View
                  className="
                    mb-4
                    h-[54px]
                    w-[54px]
                    items-center
                    justify-center
                    rounded-[17px]
                    bg-red-50
                  ">

                  <RefreshCw
                    size={25}
                    color="#DC2626"
                  />

                </View>

                <Text
                  className="
                    text-center
                    text-lg
                    font-bold
                    text-slate-900
                  ">
                  Couldn't load
                  materials
                </Text>

                <Text
                  className="
                    mt-2
                    text-center
                    text-sm
                    text-slate-500
                  ">
                  Check your connection
                  and try again.
                </Text>

                <Pressable
                  accessibilityRole="button"
                  onPress={
                    loadMaterials
                  }
                  className="
                    mt-6
                    flex-row
                    items-center
                    rounded-xl
                    bg-indigo-50
                    px-6
                    py-3
                    active:scale-[0.98]
                    active:opacity-80
                  ">

                  <RefreshCw
                    size={17}
                    color="#4F46E5"
                  />

                  <Text
                    className="
                      ml-2
                      text-sm
                      font-bold
                      text-indigo-600
                    ">
                    Try again
                  </Text>

                </Pressable>

              </View>
            ) :
            filteredMaterials.length ===
              0 ? (

              /* ========================================
                  EMPTY / NO RESULTS
              ========================================= */

              <View
                className="
                  min-h-[300px]
                  items-center
                  justify-center
                  px-6
                ">

                <View
                  className="
                    mb-6
                    h-[86px]
                    w-[86px]
                    items-center
                    justify-center
                    rounded-[28px]
                    bg-purple-50
                  ">

                  <View
                    className="
                      h-[58px]
                      w-[58px]
                      items-center
                      justify-center
                      rounded-[19px]
                      bg-indigo-50
                    ">

                    {hasSearch ||
                    hasActiveFilter ? (
                      <Search
                        size={30}
                        color="#4F46E5"
                      />
                    ) : (
                      <BookOpen
                        size={30}
                        color="#4F46E5"
                      />
                    )}

                  </View>

                </View>

                <Text
                  className="
                    text-center
                    text-xl
                    font-bold
                    text-slate-900
                  ">

                  {hasSearch
                    ? 'No materials found'
                    : activeFilter ===
                        'text'
                      ? 'No text materials yet'
                      : activeFilter ===
                          'pdf'
                        ? 'No PDF materials yet'
                        : 'Add your first material'}

                </Text>

                <Text
                  className="
                    mt-2
                    max-w-[300px]
                    text-center
                    text-sm
                    leading-5
                    text-slate-500
                  ">

                  {hasSearch
                    ? `We couldn't find anything matching "${searchText.trim()}".`
                    : activeFilter ===
                        'text'
                      ? 'This subject does not have any text materials yet.'
                      : activeFilter ===
                          'pdf'
                        ? 'This subject does not have any PDF materials yet.'
                        : 'Start by adding a text or PDF material. Image and camera sources will be added next.'}

                </Text>

                {!hasSearch &&
                  !hasActiveFilter &&
                  materials.length ===
                    0 && (
                    <Pressable
                      accessibilityRole="button"
                      onPress={
                        openAddMaterial
                      }
                      className="
                        mt-6
                        flex-row
                        items-center
                        rounded-2xl
                        bg-indigo-600
                        px-6
                        py-3
                        active:scale-[0.98]
                        active:opacity-80
                      ">

                      <Plus
                        size={18}
                        color="#FFFFFF"
                      />

                      <Text
                        className="
                          ml-2
                          text-sm
                          font-bold
                          text-white
                        ">
                        Add material
                      </Text>

                    </Pressable>
                  )}

              </View>
            ) : (

              /* ========================================
                  MATERIAL LIST
              ========================================= */

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
                        openMaterialDetails(
                          material.id,
                        )
                      }
                    />
                  ),
                )}

              </View>
            )}

          </View>

        </ScrollView>

        {/* ============================================
            FLOATING ADD
        ============================================= */}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add material"
          onPress={
            openAddMaterial
          }
          className="
            absolute
            bottom-6
            right-6
            h-[62px]
            w-[62px]
            items-center
            justify-center
            rounded-[20px]
            bg-indigo-600
            shadow-lg
          "
          style={({pressed}) => ({
            opacity:
              pressed
                ? 0.82
                : 1,

            transform: [
              {
                scale:
                  pressed
                    ? 0.95
                    : 1,
              },
            ],
          })}>

          <Plus
            size={28}
            color="#FFFFFF"
            strokeWidth={2.2}
          />

        </Pressable>

      </View>

    </SafeAreaView>
  );
};

export default SubjectMaterialsScreen;
