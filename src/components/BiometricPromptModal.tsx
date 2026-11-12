import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { Palette, SoftShadow } from '../theme/colors';

interface BiometricPromptModalProps {
  visible: boolean;
  onEnable: () => Promise<boolean>;
  onDismiss: () => void;
}

export const BiometricPromptModal: React.FC<BiometricPromptModalProps> = ({
  visible,
  onEnable,
  onDismiss,
}) => {
  const [loading, setLoading] = useState(false);

  const handleEnable = async () => {
    setLoading(true);
    try {
      const success = await onEnable();
      if (success) {
        Toast.show({
          type: 'success',
          text1: 'Biometrics Enabled',
          text2: 'You can now sign in using Face ID or Fingerprint with 1 tap.',
        });
      } else {
        Toast.show({
          type: 'info',
          text1: 'Cancelled',
          text2: 'Biometric setup was not completed.',
        });
      }
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Setup Failed',
        text2: 'Could not activate biometrics on this device.',
      });
    } finally {
      setLoading(false);
      onDismiss();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>🔐</Text>
          </View>

          <Text style={styles.title}>Enable Biometric Sign-In</Text>
          <Text style={styles.description}>
            Unlock TredBook in a single second using Face ID or Fingerprint. No need to re-enter
            passwords or request OTPs each time.
          </Text>

          <View style={styles.buttonCol}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleEnable}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>Enable 1-Tap Unlock</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={onDismiss}
              disabled={loading}
            >
              <Text style={styles.secondaryButtonText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(18, 18, 20, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: Palette.surface,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    ...SoftShadow.modal,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Palette.mint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  iconText: {
    fontSize: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Palette.textPrimary,
    letterSpacing: -0.4,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: Palette.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
  },
  buttonCol: {
    width: '100%',
    gap: 10,
  },
  primaryButton: {
    backgroundColor: Palette.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: Palette.primaryText,
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: Palette.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
});
