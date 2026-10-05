import React from 'react';
import {Image, Pressable, Text, View} from 'react-native';
import {X} from 'lucide-react-native';
import {PickedImage} from '../../services/storage/ImagePickerService';

interface MediaPreviewCardProps {
  image: PickedImage;
  details: string;
  onRemove: () => void;
}

const MediaPreviewCard = ({image, details, onRemove}: MediaPreviewCardProps) => {
  return (
    <View className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <Image
        source={{uri: image.localUri}}
        resizeMode="cover"
        className="h-[170px] w-full"
      />
      <View className="flex-row items-center p-4">
        <View className="flex-1">
          <Text numberOfLines={1} className="font-bold text-slate-900">
            {image.fileName}
          </Text>
          <Text className="mt-1 text-xs text-slate-500">{details}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Remove image"
          onPress={onRemove}
          className="h-10 w-10 items-center justify-center rounded-xl bg-slate-50">
          <X size={18} color="#64748B" />
        </Pressable>
      </View>
    </View>
  );
};

export default MediaPreviewCard;
