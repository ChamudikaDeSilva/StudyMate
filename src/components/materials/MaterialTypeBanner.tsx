import React from 'react';
import { Text, View } from 'react-native';
import { materialPresentation } from '../../constants/materialPresentation';
import { Material } from '../../domain/models/Material';
import { colors } from '../../constants/colors';

interface MaterialTypeBannerProps {
  material: Material;
}

const syncLabels = {
  synced: 'Saved',
  pending: 'Waiting to sync',
  syncing: 'Syncing',
  failed: 'Sync failed',
};

const MaterialTypeBanner = ({ material }: MaterialTypeBannerProps) => {
  const config = materialPresentation[material.sourceType];
  const Icon = config.icon;

  return (
    <View
      className="mb-5 flex-row items-center rounded-[24px] border p-4"
      style={{
        borderColor: colors.border,
        backgroundColor: colors.primaryLight,
      }}
    >
      <View className="mr-4 h-[52px] w-[52px] items-center justify-center rounded-2xl bg-white">
        <Icon size={23} color={config.foreground} />
      </View>
      <View className="flex-1">
        <Text className="text-[10px] font-bold uppercase tracking-wider text-muted">
          Source material
        </Text>
        <Text className="mt-1 text-base font-bold text-ink">
          {config.label}
        </Text>
      </View>
      <View className="rounded-full bg-white px-3 py-1.5">
        <Text
          className="text-[10px] font-semibold"
          style={{
            color:
              material.syncStatus === 'failed' ? colors.danger : colors.primary,
          }}
        >
          {syncLabels[material.syncStatus]}
        </Text>
      </View>
    </View>
  );
};

export default MaterialTypeBanner;
