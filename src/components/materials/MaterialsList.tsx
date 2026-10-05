import React from 'react';

import {
  View,
} from 'react-native';

import {
  BookOpen,
  RefreshCw,
  Search,
} from 'lucide-react-native';

import {
  Material,
} from '../../domain/models/Material';

import ScreenState
  from '../common/ScreenState';

import MaterialCard
  from './MaterialCard';


interface MaterialsListProps {

  materials:
    Material[];

  loading:
    boolean;

  showLoadError:
    boolean;

  emptyTitle:
    string;

  emptyDescription:
    string;

  hasSearch:
    boolean;

  hasActiveFilter:
    boolean;

  onRetry:
    () => Promise<void>;

  onOpenMaterial:
    (
      material:
        Material,
    ) => void;
}


const MaterialsList = ({
  materials,

  loading,

  showLoadError,

  emptyTitle,

  emptyDescription,

  hasSearch,

  hasActiveFilter,

  onRetry,

  onOpenMaterial,
}: MaterialsListProps) => {

  // =========================================================
  // LOADING
  // =========================================================

  if (
    loading
  ) {

    return (

      <ScreenState
        loading

        title="Loading materials"

        description="Preparing your study materials..."
      />
    );
  }


  // =========================================================
  // LOAD ERROR
  // =========================================================

  if (
    showLoadError
  ) {

    return (

      <ScreenState
        title="Couldn't load materials"

        description="Check your connection and try again."

        icon={
          RefreshCw
        }

        iconColor="#DC2626"

        actionTitle="Try again"

        onAction={() => {

          void onRetry();
        }}
      />
    );
  }


  // =========================================================
  // EMPTY
  // =========================================================

  if (
    materials.length ===
    0
  ) {

    return (

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
    );
  }


  // =========================================================
  // LIST
  // =========================================================

  return (

    <View>

      {materials.map(
        material => (

          <MaterialCard
            key={
              material.id
            }

            material={
              material
            }

            onPress={() =>
              onOpenMaterial(
                material,
              )
            }
          />

        ),
      )}

    </View>
  );
};


export default MaterialsList;