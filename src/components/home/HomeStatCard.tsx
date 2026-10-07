import React from 'react';

import {
  Text,
  View,
} from 'react-native';

import {LucideIcon} from 'lucide-react-native';

interface HomeStatCardProps {
  value: string | number;

  label: string;

  icon: LucideIcon;

  iconColor: string;

  iconBackground: string;
}

const HomeStatCard = ({
  value,
  label,
  icon: Icon,
  iconColor,
  iconBackground,
}: HomeStatCardProps) => {
  return (
    <View
      className="
        min-h-[120px]
        flex-1
        rounded-[18px]
        border
        border-slate-200
        bg-white
        p-4
      ">

      <View
        className="
          mb-4
          h-[38px]
          w-[38px]
          items-center
          justify-center
          rounded-xl
        "
        style={{
          backgroundColor:
            iconBackground,
        }}>

        <Icon
          size={20}
          color={iconColor}
          strokeWidth={2.2}
        />

      </View>

      <Text
        className="
          text-2xl
          font-bold
          text-slate-900
        ">
        {value}
      </Text>

      <Text
        className="
          mt-1
          text-sm
          text-slate-500
        ">
        {label}
      </Text>

    </View>
  );
};

export default HomeStatCard;