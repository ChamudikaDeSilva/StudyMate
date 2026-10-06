import React from 'react';

import {
  ScrollView,
  Text,
  View,
} from 'react-native';

import {
  RefreshCw,
} from 'lucide-react-native';

import {
  MaterialSummary,
} from '../../domain/models/MaterialSummary';

import ActionButton
  from '../common/ActionButton';

import AiKeyPointsCard
  from './AiKeyPointsCard';

import AiStudyTipsCard
  from './AiStudyTipsCard';

import AiSummaryCard
  from './AiSummaryCard';

import AiSummaryOverviewCard
  from './AiSummaryOverviewCard';


interface Props {

  summary:
    MaterialSummary;

  materialTitle:
    string;

  generating:
    boolean;

  onGenerateAgain:
    () => void;
}


const AiSummaryResult = ({
  summary,
  materialTitle,
  generating,
  onGenerateAgain,
}: Props) => {

  return (

    <ScrollView
      className="
        flex-1
      "

      contentContainerStyle={{
        paddingHorizontal:
          20,

        paddingTop:
          20,

        paddingBottom:
          36,
      }}

      showsVerticalScrollIndicator={
        false
      }>

      {/* =====================================================
          OVERVIEW
      ====================================================== */}

      <View
        className="
          mb-4
        ">

        <AiSummaryOverviewCard
          summary={
            summary
          }

          fallbackTitle={
            materialTitle
          }
        />

      </View>


      {/* =====================================================
          SUMMARY
      ====================================================== */}

      <View
        className="
          mb-4
        ">

        <AiSummaryCard
          summary={
            summary.summary
          }
        />

      </View>


      {/* =====================================================
          KEY POINTS
      ====================================================== */}

      <View
        className="
          mb-4
        ">

        <AiKeyPointsCard
          points={
            summary.keyPoints
          }
        />

      </View>


      {/* =====================================================
          STUDY TIPS
      ====================================================== */}

      <View
        className="
          mb-5
        ">

        <AiStudyTipsCard
          tips={
            summary.studyTips
          }
        />

      </View>


      {/* =====================================================
          GENERATE AGAIN
      ====================================================== */}

      <ActionButton
        title="Generate Again"

        onPress={
          onGenerateAgain
        }

        loading={
          generating
        }

        disabled={
          generating
        }

        tone="primary"

        variant="soft"

        icon={
          <RefreshCw
            size={18}
            color="#4F46E5"
          />
        }
      />


      {/* =====================================================
          DISCLAIMER
      ====================================================== */}

      <Text
        className="
          mt-4
          text-center
          text-xs
          leading-[18px]
          text-slate-400
        ">

        AI-generated study content may
        contain mistakes. Review important
        points against the original material.

      </Text>

    </ScrollView>
  );
};


export default AiSummaryResult;