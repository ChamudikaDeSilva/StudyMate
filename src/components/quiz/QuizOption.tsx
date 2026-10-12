import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Check, CheckCircle2, XCircle } from 'lucide-react-native';

type OptionState = 'default' | 'selected' | 'correct' | 'incorrect';

interface Props {
  index: number;
  text: string;
  state?: OptionState;
  caption?: string;
  onPress?: () => void;
}

const colors: Record<
  OptionState,
  { border: string; background: string; text: string; badge: string }
> = {
  default: {
    border: '#E6E2F1',
    background: '#FFFFFF',
    text: '#201C33',
    badge: '#F2EFFB',
  },
  selected: {
    border: '#5B4DE8',
    background: '#F0EDFF',
    text: '#4435B8',
    badge: '#5B4DE8',
  },
  correct: {
    border: '#A7E4C5',
    background: '#EFFAF4',
    text: '#18704A',
    badge: '#D5F3E3',
  },
  incorrect: {
    border: '#F1B8C4',
    background: '#FFF1F4',
    text: '#B62C4D',
    badge: '#FCE0E7',
  },
};

const QuizOption = ({
  index,
  text,
  state = 'default',
  caption,
  onPress,
}: Props) => {
  const palette = colors[state];
  const label = String.fromCharCode(65 + index);
  const badgeTextColor = state === 'selected' ? '#FFFFFF' : palette.text;
  const content = (
    <>
      <View
        className="h-9 w-9 items-center justify-center rounded-xl"
        style={{ backgroundColor: palette.badge }}
      >
        <Text
          className="text-sm font-extrabold"
          style={{ color: badgeTextColor }}
        >
          {label}
        </Text>
      </View>
      <View className="ml-3 flex-1">
        <Text
          className="text-[15px] font-semibold leading-[22px]"
          style={{ color: palette.text }}
        >
          {text}
        </Text>
        {!!caption && (
          <Text
            className="mt-1 text-xs font-bold"
            style={{ color: palette.text }}
          >
            {caption}
          </Text>
        )}
      </View>
      {state === 'selected' ? <Check size={20} color={palette.text} /> : null}
      {state === 'correct' ? (
        <CheckCircle2 size={20} color={palette.text} />
      ) : null}
      {state === 'incorrect' ? (
        <XCircle size={20} color={palette.text} />
      ) : null}
    </>
  );
  const style = {
    borderColor: palette.border,
    backgroundColor: palette.background,
  };
  const className =
    'mb-3 min-h-[66px] flex-row items-center gap-1 rounded-2xl border px-4 py-3';

  return onPress ? (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={`${label}. ${text}`}
      accessibilityState={{
        checked: state === 'selected',
        selected: state === 'selected',
      }}
      onPress={onPress}
      className={`${className} active:opacity-80`}
      style={style}
    >
      {content}
    </Pressable>
  ) : (
    <View className={className} style={style}>
      {content}
    </View>
  );
};

export default QuizOption;
