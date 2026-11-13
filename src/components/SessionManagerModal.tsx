import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import {
  Smartphone,
  Monitor,
  Tablet,
  X,
  ShieldCheck,
  LogOut,
  MapPin,
  Clock,
  Trash2,
} from 'lucide-react-native';
import { sessionService, DeviceSession } from '../services/sessionService';
import { useLanguage } from '../context/LanguageContext';

interface SessionManagerModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SessionManagerModal: React.FC<SessionManagerModalProps> = ({
  visible,
  onClose,
}) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState<boolean>(true);
  const [sessions, setSessions] = useState<DeviceSession[]>([]);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  useEffect(() => {
    if (visible) {
      loadSessions();
    }
  }, [visible]);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const data = await sessionService.getSessions();
      setSessions(data);
    } catch (err: any) {
      console.warn('Failed to load device sessions:', err?.message || err);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSession = (session: DeviceSession) => {
    Alert.alert(
      'Revoke Device Session?',
      `Are you sure you want to log out from "${session.deviceName}" (${session.ipAddress})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              await sessionService.deleteSession(session.id);
              Alert.alert('Session Terminated', `Device "${session.deviceName}" has been logged out.`);
              loadSessions();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Could not revoke session');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleRevokeAllOther = () => {
    Alert.alert(
      'Log Out All Other Devices?',
      'This will instantly invalidate all active refresh tokens and sign out of all other browsers, laptops, and tablets.',
      [
        { text: 'Keep Sessions', style: 'cancel' },
        {
          text: 'Log Out Others',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              await sessionService.deleteOtherSessions();
              Alert.alert('Success', 'All other device sessions have been revoked.');
              loadSessions();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Could not revoke other sessions');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ],
    );
  };

  const otherSessionsCount = sessions.filter((s) => !s.isCurrent).length;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <View style={styles.titleRow}>
                <ShieldCheck size={22} color="#10B981" />
                <Text style={styles.title}>{t.sessionTitle}</Text>
              </View>
              <Text style={styles.subtitle}>{t.sessionSubtitle}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#10B981" />
              <Text style={styles.loadingText}>Fetching active sessions...</Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              {/* Security Status Box */}
              <View style={styles.securityBox}>
                <View style={styles.securityBoxHeader}>
                  <ShieldCheck size={18} color="#059669" />
                  <Text style={styles.securityBoxTitle}>Account Protection Active</Text>
                </View>
                <Text style={styles.securityBoxDesc}>
                  You are currently logged into {sessions.length} device{sessions.length > 1 ? 's' : ''}. Unrecognized sessions can be revoked immediately.
                </Text>
              </View>

              {/* Sessions List */}
              <View style={styles.sessionList}>
                {sessions.map((item) => (
                  <View key={item.id} style={[styles.sessionCard, item.isCurrent && styles.sessionCardCurrent]}>
                    <View style={styles.deviceIconBox}>
                      {item.deviceType === 'desktop' ? (
                        <Monitor size={22} color="#4B5563" />
                      ) : item.deviceType === 'tablet' ? (
                        <Tablet size={22} color="#4B5563" />
                      ) : (
                        <Smartphone size={22} color="#4B5563" />
                      )}
                    </View>

                    <View style={{ flex: 1 }}>
                      <View style={styles.deviceTitleRow}>
                        <Text style={styles.deviceName}>{item.deviceName}</Text>
                        {item.isCurrent && (
                          <View style={styles.currentBadge}>
                            <View style={styles.greenDot} />
                            <Text style={styles.currentBadgeText}>{t.currentDevice}</Text>
                          </View>
                        )}
                      </View>

                      <Text style={styles.browserMeta}>{item.browserOrApp} • {item.ipAddress}</Text>

                      <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                          <MapPin size={12} color="#6B7280" />
                          <Text style={styles.metaText}>{item.location}</Text>
                        </View>
                        <View style={styles.metaItem}>
                          <Clock size={12} color="#6B7280" />
                          <Text style={styles.metaText}>
                            {item.isCurrent ? 'Active now' : new Date(item.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {!item.isCurrent && (
                      <TouchableOpacity
                        style={styles.revokeBtn}
                        onPress={() => handleRevokeSession(item)}
                        disabled={actionLoading}
                      >
                        <Trash2 size={16} color="#DC2626" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>

              {/* 1-Tap Log Out All Other Devices */}
              {otherSessionsCount > 0 && (
                <TouchableOpacity
                  style={[styles.revokeAllBtn, actionLoading && { opacity: 0.7 }]}
                  onPress={handleRevokeAllOther}
                  disabled={actionLoading}
                >
                  <LogOut size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.revokeAllBtnText}>{t.logOutAllOther} ({otherSessionsCount})</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: '#6B7280',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  securityBox: {
    backgroundColor: '#ECFDF5',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 16,
  },
  securityBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  securityBoxTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#065F46',
  },
  securityBoxDesc: {
    fontSize: 12,
    color: '#047857',
    lineHeight: 18,
  },
  sessionList: {
    gap: 12,
    marginBottom: 20,
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sessionCardCurrent: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  deviceIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  deviceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  deviceName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  currentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
  },
  currentBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#065F46',
  },
  browserMeta: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: '#4B5563',
  },
  revokeBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    marginLeft: 8,
  },
  revokeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  revokeAllBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
