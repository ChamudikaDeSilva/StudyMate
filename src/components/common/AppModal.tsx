import React, { useContext, useId, useLayoutEffect } from 'react';
import { Modal, ModalProps, StyleSheet, View } from 'react-native';
import { AppAlertContext } from '../../context/AppAlertContext';
import AppDialog from './AppDialog';

/** A native modal that hosts app dialogs without opening a second native modal. */
const AppModal = ({
  children,
  visible = true,
  onRequestClose,
  onDismiss,
  ...props
}: ModalProps) => {
  const context = useContext(AppAlertContext);
  const id = useId();
  const registerHost = context?.registerHost;
  const closeHost = context?.closeHost;
  const removeHost = context?.removeHost;
  useLayoutEffect(() => {
    if (visible) {
      registerHost?.(id);
    } else {
      closeHost?.(id);
    }
  }, [visible, registerHost, closeHost, id]);
  useLayoutEffect(() => () => removeHost?.(id), [removeHost, id]);

  if (!context) {
    return (
      <Modal
        {...props}
        visible={visible}
        onRequestClose={onRequestClose}
        onDismiss={onDismiss}
      >
        {children}
      </Modal>
    );
  }
  const dialog = context.hostId === id ? context.active : null;
  return (
    <Modal
      {...props}
      visible={visible && !context.rootVisible && !context.rootClosing}
      onRequestClose={event => {
        if (dialog) {
          context.dismiss(dialog.id);
        } else {
          onRequestClose?.(event);
        }
      }}
      onDismiss={() => {
        removeHost?.(id);
        if (visible) {
          registerHost?.(id);
        }
        onDismiss?.();
      }}
    >
      <View style={styles.content}>
        <View
          style={styles.content}
          pointerEvents={dialog ? 'none' : 'auto'}
          accessibilityElementsHidden={!!dialog}
          importantForAccessibility={dialog ? 'no-hide-descendants' : 'auto'}
        >
          {children}
        </View>
        {dialog && (
          <AppDialog
            title={dialog.title}
            message={dialog.message}
            buttons={dialog.buttons}
            options={dialog.options}
            onSelect={index => context.select(dialog.id, index)}
            onDismiss={() => context.dismiss(dialog.id)}
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({ content: { flex: 1 } });

export default AppModal;
