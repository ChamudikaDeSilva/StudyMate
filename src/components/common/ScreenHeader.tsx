import React, {
  ReactNode,
} from 'react';

import {
  Text,
  View,
} from 'react-native';

import BackButton
  from './BackButton';


interface ScreenHeaderProps {

  title:
    string;

  subtitle?:
    string;

  onBack?:
    () => void;

  right?:
    ReactNode;
}


const ScreenHeader = ({
  title,
  subtitle,
  onBack,
  right,
}: ScreenHeaderProps) => {

  return (

    <View
      className="
        mb-8
        flex-row
        items-center
      ">

      {!!onBack && (

        <View
          className="
            mr-4
          ">

          <BackButton
            onPress={
              onBack
            }
          />

        </View>

      )}


      <View
        className="
          flex-1
        ">

        <Text
          numberOfLines={1}
          className="
            text-[26px]
            font-bold
            tracking-tight
            text-slate-900
          ">

          {title}

        </Text>


        {!!subtitle && (

          <Text
            numberOfLines={1}
            className="
              mt-1
              text-sm
              text-slate-500
            ">

            {subtitle}

          </Text>

        )}

      </View>


      {!!right && (

        <View
          className="
            ml-3
          ">

          {right}

        </View>

      )}

    </View>
  );
};


export default ScreenHeader;