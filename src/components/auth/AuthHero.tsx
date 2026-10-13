import React from 'react';
import { Text, View } from 'react-native';
import { BookOpen, CircleCheck, Layers, Sparkles } from 'lucide-react-native';
import { colors } from '../../constants/colors';
interface AuthHeroProps {
  variant: 'login' | 'register';
}
const features = [
  { label: 'Notes', icon: BookOpen, color: colors.primary },
  { label: 'Flashcards', icon: Layers, color: colors.primary },
  { label: 'Quizzes', icon: CircleCheck, color: colors.success },
];
const AuthHero = ({ variant }: AuthHeroProps) => {
  const isLogin = variant === 'login';
  return (
    <View className="mb-7">
      <View className="mb-3 flex-row items-center self-start rounded-full border border-brand-100 bg-brand-50 px-3 py-1.5">
        <Sparkles size={12} color={colors.primary} strokeWidth={2} />
        <Text className="ml-1.5 text-[10px] font-bold tracking-[1.5px] text-brand-700">
          {isLogin ? 'YOUR STUDY SPACE' : 'A FRESH START'}
        </Text>
      </View>
      <Text
        accessibilityRole="header"
        className="text-[32px] font-bold leading-[38px] tracking-tight text-ink"
      >
        {isLogin
          ? 'Welcome back.\nLet’s keep learning.'
          : 'Your study space,\nyour next chapter.'}
      </Text>
      <Text className="mt-3 text-[15px] leading-[23px] text-muted">
        {isLogin
          ? 'Pick up where you left off, with all your study tools in one place.'
          : 'Bring your notes together and turn them into smarter ways to learn.'}
      </Text>
      {isLogin && (
        <View className="mt-5 flex-row flex-wrap gap-2">
          {features.map(({ label, icon: Icon, color }) => (
            <View
              key={label}
              className="flex-row items-center rounded-full border border-line bg-white px-3 py-2"
            >
              <Icon size={14} color={color} />
              <Text className="ml-1.5 text-xs font-medium text-slate-600">
                {label}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};
export default AuthHero;
