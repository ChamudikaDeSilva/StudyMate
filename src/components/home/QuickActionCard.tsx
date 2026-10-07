import React from 'react';

import {
  Pressable,
  Text,
  View,
} from 'react-native';

import {
  ChevronRight,
  LucideIcon,
} from 'lucide-react-native';

interface QuickActionCardProps {
  title: string;

  description: string;

  icon: LucideIcon;

  iconColor: string;

  iconBackground: string;

  onPress?: () => void;

  disabled?: boolean;
}

const QuickActionCard = ({
  title,
  description,
  icon: Icon,
  iconColor,
  iconBackground,
  onPress,
  disabled = false,
}: QuickActionCardProps) => {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      className={`
        mb-4
        min-h-[145px]
        w-[48%]
        justify-between
        rounded-[18px]
        border
        border-slate-200
        bg-white
        p-4

        ${
          disabled
            ? 'opacity-50'
            : 'active:scale-[0.98] active:opacity-80'
        }
      `}>

      <View
        className="
          h-11
          w-11
          items-center
          justify-center
          rounded-[13px]
        "
        style={{
          backgroundColor:
            iconBackground,
        }}>

        <Icon
          size={22}
          color={iconColor}
          strokeWidth={2.2}
        />

      </View>

      <View
        className="
          flex-row
          items-end
        ">

        <View
          className="
            flex-1
            pr-1
          ">

          <Text
            className="
              text-base
              font-bold
              text-slate-900
            ">
            {title}
          </Text>

          <Text
            className="
              mt-1
              text-xs
              leading-[17px]
              text-slate-500
            "
            numberOfLines={2}>
            {description}
          </Text>

        </View>

        {!disabled && (
          <ChevronRight
            size={18}
            color="#94A3B8"
          />
        )}

      </View>

    </Pressable>
  );
};

export default QuickActionCard;