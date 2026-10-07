import React from 'react';

import {
  Text,
  View,
} from 'react-native';

import {
  RefreshCw,
} from 'lucide-react-native';

import ActionButton
  from '../common/ActionButton';


interface Props {

  error:
    string;

  generating:
    boolean;

  onRetry:
    () => void;
}


const AiSummaryErrorState = ({
  error,
  generating,
  onRetry,
}: Props) => {

  return (

    <View
      className="
        flex-1
        items-center
        justify-center
        px-6
      ">

      <View
        className="
          w-full
          rounded-[20px]
          border
          border-red-200
          bg-red-50
          p-5
        ">

        <View
          className="
            mb-4
            h-12
            w-12
            items-center
            justify-center
            rounded-2xl
            bg-red-100
          ">

          <RefreshCw
            size={22}
            color="#DC2626"
          />

        </View>


        <Text
          className="
            text-lg
            font-bold
            text-slate-900
          ">

          Summary unavailable

        </Text>


        <Text
          className="
            mt-2
            text-sm
            leading-5
            text-slate-600
          ">

          {error}

        </Text>


        <View
          className="
            mt-5
          ">

          <ActionButton
            title="Try Again"

            onPress={
              onRetry
            }

            loading={
              generating
            }

            disabled={
              generating
            }

            tone="primary"

            variant="solid"

            icon={
              <RefreshCw
                size={18}
                color="#FFFFFF"
              />
            }
          />

        </View>

      </View>

    </View>
  );
};


export default AiSummaryErrorState;