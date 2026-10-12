import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { X } from 'lucide-react-native';
import { PickedImage } from '../../services/storage/ImagePickerService';
import { colors } from '../../constants/colors';

interface MediaPreviewCardProps {
  image: PickedImage;
  details: string;
  disabled?: boolean;
  onRemove: () => void;
}

const MediaPreviewCard = ({
  image,
  details,
  disabled = false,
  onRemove,
}: MediaPreviewCardProps) => {
  return (
    <View className="mb-5 overflow-hidden rounded-[20px] border border-line bg-canvas">
      <Image
        source={{ uri: image.localUri }}
        resizeMode="cover"
        className="h-[190px] w-full"
      />
      <View className="flex-row items-center p-4">
        <View className="flex-1">
          <Text numberOfLines={2} className="font-bold text-ink">
            {image.fileName}
          </Text>
          <Text className="mt-1 text-xs text-muted">{details}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Remove image"
          accessibilityState={{ disabled }}
          disabled={disabled}
          onPress={onRemove}
          className={`ml-2 h-11 w-11 items-center justify-center rounded-xl bg-white ${
            disabled ? 'opacity-50' : 'active:opacity-60'
          }`}
        >
          <X size={18} color={colors.textSecondary} />
        </Pressable>
      </View>
    </View>
  );
};

export default MediaPreviewCard;
