import React from 'react';
import {
  AlertButton,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CircleAlert,
  CircleCheck,
  Info,
  LogOut,
  Sparkles,
  Trash2,
  WifiOff,
} from 'lucide-react-native';
import { AppAlertOptions, AppAlertTone } from '../../context/AppAlertContext';
import { colors } from '../../constants/colors';
import ActionButton from './ActionButton';

interface AppDialogProps {
  title: string;
  message?: string;
  buttons: AlertButton[];
  options: AppAlertOptions;
  onSelect: (index: number) => void;
  onDismiss: () => void;
}

const palette: Record<AppAlertTone, { main: string; soft: string }> = {
  primary: { main: colors.primary, soft: colors.primaryLight },
  info: { main: colors.info, soft: colors.infoLight },
  success: { main: colors.success, soft: colors.successLight },
  warning: { main: colors.warning, soft: colors.warningLight },
  danger: { main: colors.danger, soft: colors.dangerLight },
};

const AppDialog = ({
  title,
  message,
  buttons,
  options,
  onSelect,
  onDismiss,
}: AppDialogProps) => {
  const tone =
    options.tone ??
    (buttons.some(button => button.style === 'destructive')
      ? 'danger'
      : 'primary');
  const appearance = palette[tone];
  const Icon =
    options.icon === 'sign-out'
      ? LogOut
      : options.icon === 'delete'
      ? Trash2
      : options.icon === 'connection'
      ? WifiOff
      : tone === 'success'
      ? CircleCheck
      : tone === 'danger' || tone === 'warning'
      ? CircleAlert
      : tone === 'info'
      ? Info
      : Sparkles;
  return (
    <View testID="app-dialog-overlay" style={styles.overlay}>
      <Pressable
        testID="app-dialog-backdrop"
        accessible={false}
        disabled={!options.cancelable}
        onPress={onDismiss}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView pointerEvents="box-none" style={styles.safeArea}>
        <ScrollView
          pointerEvents="box-none"
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Pressable
            testID="app-dialog-scroll-backdrop"
            accessible={false}
            onPress={() => {
              if (options.cancelable) {
                onDismiss();
              }
            }}
            style={styles.scrollContent}
          >
            <Pressable
              testID="app-dialog-card"
              accessible={false}
              accessibilityViewIsModal
              onPress={event => event.stopPropagation()}
              style={styles.card}
            >
              <View
                pointerEvents="none"
                style={[styles.accent, { backgroundColor: appearance.soft }]}
              />
              <View style={[styles.icon, { backgroundColor: appearance.soft }]}>
                <Icon size={28} color={appearance.main} strokeWidth={1.8} />
              </View>
              <Text accessibilityRole="header" style={styles.title}>
                {title}
              </Text>
              {!!message && (
                <Text
                  accessibilityRole="alert"
                  accessibilityLiveRegion="polite"
                  style={styles.message}
                >
                  {message}
                </Text>
              )}
              <View style={styles.actions}>
                {buttons.map((button, index) => (
                  <ActionButton
                    key={`${index}-${button.text}`}
                    title={button.text ?? 'OK'}
                    onPress={() => onSelect(index)}
                    tone={
                      button.style === 'destructive'
                        ? 'danger'
                        : button.style === 'cancel'
                        ? 'neutral'
                        : tone === 'warning'
                        ? 'primary'
                        : tone
                    }
                    variant={button.style === 'cancel' ? 'soft' : 'solid'}
                    style={styles.action}
                  />
                ))}
              </View>
            </Pressable>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.overlay,
  },
  safeArea: { flex: 1 },
  scrollContainer: { flexGrow: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    padding: 25,
    backgroundColor: colors.surface,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 30,
    elevation: 14,
  },
  accent: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    top: -80,
    right: -55,
    opacity: 0.65,
  },
  icon: {
    width: 64,
    height: 64,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 23,
    lineHeight: 30,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: colors.textPrimary,
  },
  message: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 23,
    color: colors.textSecondary,
  },
  actions: { marginTop: 25, gap: 10 },
  action: { minHeight: 52 },
});

export default AppDialog;
