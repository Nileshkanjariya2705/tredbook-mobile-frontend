import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Palette } from '../theme/colors';
import {
  offlineSyncService,
  OfflineMutation,
  SyncStatus,
  ConflictRecord,
} from '../services/offlineSyncService';
import { useLanguage } from '../context/LanguageContext';
import {
  Cloud,
  CloudOff,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Package,
  CreditCard,
  X,
  PlusCircle,
} from 'lucide-react-native';

interface OfflineSyncModalProps {
  visible: boolean;
  onClose: () => void;
}

export const OfflineSyncModal: React.FC<OfflineSyncModalProps> = ({ visible, onClose }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'OUTBOX' | 'CONFLICTS' | 'STATUS'>('OUTBOX');
  const [outbox, setOutbox] = useState<OfflineMutation[]>([]);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [conflicts, setConflicts] = useState<ConflictRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadData();
    }
    const unsubscribe = offlineSyncService.subscribe((event, data) => {
      if (event === 'OUTBOX_UPDATED') {
        setOutbox(data);
      } else if (event === 'STATUS_CHANGED') {
        if (data.isOffline !== undefined) setIsOfflineMode(data.isOffline);
        if (data.syncing !== undefined) setIsSyncing(data.syncing);
      } else if (event === 'SYNC_COMPLETE') {
        loadData();
      }
    });
    return unsubscribe;
  }, [visible]);

  const loadData = async () => {
    setLoading(true);
    try {
      setOutbox(offlineSyncService.getOutbox());
      setIsOfflineMode(offlineSyncService.isOfflineMode());

      const [statusRes, conflictRes] = await Promise.all([
        offlineSyncService.getSyncStatus().catch(() => null),
        offlineSyncService.getConflicts().catch(() => ({ totalConflicts: 0, conflicts: [] })),
      ]);

      if (statusRes) setSyncStatus(statusRes);
      if (conflictRes?.conflicts) setConflicts(conflictRes.conflicts);
    } catch {
      // Offline fallback
    } finally {
      setLoading(false);
    }
  };

  const handleToggleOffline = (val: boolean) => {
    const newState = offlineSyncService.toggleSimulateOffline(val);
    setIsOfflineMode(newState);
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      const res = await offlineSyncService.flushOutbox();
      Alert.alert(
        'Sync Complete',
        `Applied: ${res.applied}\nDuplicates Ignored: ${res.duplicates}\nConflicts Resolved: ${res.conflicts}\nFailed: ${res.failed}`
      );
      loadData();
    } catch {
      Alert.alert('Sync Error', 'Could not reach sync server. Queue remains preserved in Outbox.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleEnqueueTestInvoice = async () => {
    const rand = Math.floor(1000 + Math.random() * 9000);
    await offlineSyncService.enqueueMutation('INVOICE', 'CREATE', {
      invoiceNumber: `INV-OFF-${rand}`,
      customerName: `Retail Buyer #${rand}`,
      grandTotal: 1450,
      itemsCount: 2,
    });
    Alert.alert('Enqueued to Outbox', `Offline invoice INV-OFF-${rand} added to persistent queue.`);
  };

  const handleEnqueueConflictItem = async () => {
    // Deliberately pass an older baseVersion to test conflict resolution
    await offlineSyncService.enqueueMutation(
      'ITEM',
      'UPDATE',
      {
        id: 101,
        sellingPrice: 380,
      },
      2 // baseline version older than server's version 5
    );
    Alert.alert('Enqueued Conflicting Item', 'Item update with stale baseVersion enqueued to trigger conflict resolution.');
  };

  const renderEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'INVOICE':
        return <FileText size={18} color={Palette.primary} />;
      case 'ITEM':
        return <Package size={18} color={Palette.lilacDark} />;
      case 'PAYMENT':
        return <CreditCard size={18} color={Palette.mintDark} />;
      default:
        return <Clock size={18} color={Palette.textSecondary} />;
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              {isOfflineMode ? (
                <CloudOff size={24} color={Palette.danger} />
              ) : (
                <Cloud size={24} color={Palette.primary} />
              )}
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.headerTitle}>{t.offlineSync}</Text>
                <Text style={styles.headerSubtitle}>
                  {isOfflineMode ? '🔴 Offline Mode Enabled' : '🟢 Cloud Connected & Ready'}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <X size={20} color={Palette.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Quick Controls Bar */}
          <View style={styles.controlsBar}>
            <View style={styles.controlItem}>
              <Text style={styles.controlLabel}>{t.simulateOffline}</Text>
              <Switch
                value={isOfflineMode}
                onValueChange={handleToggleOffline}
                trackColor={{ false: '#cbd5e1', true: '#fca5a5' }}
                thumbColor={isOfflineMode ? Palette.danger : '#ffffff'}
              />
            </View>
            <TouchableOpacity
              style={[styles.syncNowBtn, (isSyncing || isOfflineMode) && styles.syncNowBtnDisabled]}
              onPress={handleSyncNow}
              disabled={isSyncing || isOfflineMode}
              activeOpacity={0.7}
            >
              {isSyncing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <RefreshCw size={14} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={styles.syncNowBtnText}>{t.syncNow}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Tab Navigation */}
          <View style={styles.tabsRow}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'OUTBOX' && styles.tabBtnActive]}
              onPress={() => setActiveTab('OUTBOX')}
            >
              <Text style={[styles.tabText, activeTab === 'OUTBOX' && styles.tabTextActive]}>
                📦 Outbox ({outbox.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'CONFLICTS' && styles.tabBtnActive]}
              onPress={() => setActiveTab('CONFLICTS')}
            >
              <Text style={[styles.tabText, activeTab === 'CONFLICTS' && styles.tabTextActive]}>
                ⚡ Conflicts ({conflicts.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'STATUS' && styles.tabBtnActive]}
              onPress={() => setActiveTab('STATUS')}
            >
              <Text style={[styles.tabText, activeTab === 'STATUS' && styles.tabTextActive]}>
                📊 Engine
              </Text>
            </TouchableOpacity>
          </View>

          {/* Main Content */}
          <ScrollView style={styles.contentScroll} contentContainerStyle={{ paddingBottom: 24 }}>
            {activeTab === 'OUTBOX' && (
              <View>
                {/* Simulation Shortcut Buttons */}
                <View style={styles.quickActionsCard}>
                  <Text style={styles.sectionTitle}>Simulate Offline Actions</Text>
                  <View style={styles.quickActionsRow}>
                    <TouchableOpacity
                      style={styles.actionPill}
                      onPress={handleEnqueueTestInvoice}
                      activeOpacity={0.7}
                    >
                      <PlusCircle size={14} color={Palette.primary} />
                      <Text style={styles.actionPillText}>+ Offline Bill</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionPill, { borderColor: Palette.warning }]}
                      onPress={handleEnqueueConflictItem}
                      activeOpacity={0.7}
                    >
                      <AlertTriangle size={14} color={Palette.warning} />
                      <Text style={[styles.actionPillText, { color: Palette.warning }]}>+ Stale Item</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {outbox.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <CheckCircle2 size={36} color={Palette.mintDark} />
                    <Text style={styles.emptyTitle}>{t.syncedJustNow}</Text>
                    <Text style={styles.emptySubtitle}>All offline transactions are completely synced.</Text>
                  </View>
                ) : (
                  outbox.map((mut) => (
                    <View key={mut.mutationId} style={styles.mutationCard}>
                      <View style={styles.mutHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          {renderEntityIcon(mut.entityType)}
                          <Text style={styles.mutType}>{mut.entityType}</Text>
                          <View style={styles.actionBadge}>
                            <Text style={styles.actionBadgeText}>{mut.action}</Text>
                          </View>
                        </View>
                        <Text style={styles.timeAgo}>
                          {new Date(mut.clientTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </View>

                      <Text style={styles.mutPayload}>
                        {mut.entityType === 'INVOICE'
                          ? `Bill #${mut.payload.invoiceNumber} • ₹${mut.payload.grandTotal}`
                          : mut.entityType === 'ITEM'
                          ? `Item #${mut.payload.id} • Rate ₹${mut.payload.sellingPrice}`
                          : JSON.stringify(mut.payload)}
                      </Text>

                      <View style={styles.mutFooter}>
                        <Text style={styles.idempotencyText}>Key: {mut.idempotencyKey.slice(0, 20)}...</Text>
                        <View style={styles.statusPill}>
                          <Clock size={12} color="#f59e0b" />
                          <Text style={styles.statusPillText}>Pending Push</Text>
                        </View>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}

            {activeTab === 'CONFLICTS' && (
              <View>
                {conflicts.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <CheckCircle2 size={36} color={Palette.primary} />
                    <Text style={styles.emptyTitle}>Zero Unresolved Conflicts</Text>
                    <Text style={styles.emptySubtitle}>All data branches merged deterministically.</Text>
                  </View>
                ) : (
                  conflicts.map((conf) => (
                    <View key={conf.conflictId} style={styles.conflictCard}>
                      <View style={styles.conflictHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <AlertTriangle size={16} color={Palette.warning} />
                          <Text style={styles.conflictEntity}>{conf.entityType} #{conf.entityId}</Text>
                        </View>
                        <View style={styles.strategyPill}>
                          <Text style={styles.strategyPillText}>{conf.resolutionStrategy}</Text>
                        </View>
                      </View>

                      <View style={styles.conflictGrid}>
                        <View style={styles.conflictCol}>
                          <Text style={styles.colLabel}>Client (Stale)</Text>
                          <Text style={styles.colVal}>₹{conf.clientValue?.sellingPrice}</Text>
                          <Text style={styles.subCol}>Base v{conf.clientValue?.baseVersion}</Text>
                        </View>
                        <View style={styles.conflictCol}>
                          <Text style={styles.colLabel}>Server (Current)</Text>
                          <Text style={styles.colVal}>₹{conf.serverValue?.sellingPrice}</Text>
                          <Text style={styles.subCol}>Ver v{conf.serverValue?.currentVersion}</Text>
                        </View>
                        <View style={[styles.conflictCol, { backgroundColor: '#f0fdf4' }]}>
                          <Text style={[styles.colLabel, { color: Palette.mintDark }]}>Resolved</Text>
                          <Text style={[styles.colVal, { color: Palette.mintDark }]}>₹{conf.resolvedValue?.sellingPrice}</Text>
                          <Text style={[styles.subCol, { color: Palette.mintDark }]}>LWW Overwrite</Text>
                        </View>
                      </View>

                      <Text style={styles.conflictTime}>
                        Audit ID: {conf.conflictId} • {new Date(conf.timestamp).toLocaleTimeString()}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            )}

            {activeTab === 'STATUS' && (
              <View>
                <View style={styles.statusCard}>
                  <Text style={styles.statusCardTitle}>Sync Engine Metrics</Text>
                  <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>Protocol Version</Text>
                    <Text style={styles.metricVal}>{syncStatus?.protocolVersion || '1.2.0'}</Text>
                  </View>
                  <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>Server Sequence Cursor</Text>
                    <Text style={styles.metricVal}>#{syncStatus?.serverSequenceVersion || 1000}</Text>
                  </View>
                  <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>Total Mutations Applied</Text>
                    <Text style={[styles.metricVal, { color: Palette.mintDark }]}>
                      {syncStatus?.totalAppliedMutations || 0}
                    </Text>
                  </View>
                  <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>Duplicate Re-transmissions Prevented</Text>
                    <Text style={[styles.metricVal, { color: Palette.primary }]}>
                      {syncStatus?.totalDuplicatesPrevented || 0}
                    </Text>
                  </View>
                  <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>Conflicts Automatically Reconciled</Text>
                    <Text style={[styles.metricVal, { color: Palette.warning }]}>
                      {syncStatus?.totalConflictsResolved || conflicts.length}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.clearOutboxBtn}
                  onPress={() => {
                    offlineSyncService.clearOutbox();
                    Alert.alert('Cleared', 'Outbox cache wiped.');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.clearOutboxBtnText}>Clear Local Outbox Cache</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: '65%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  controlsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  controlItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.textPrimary,
    marginRight: 8,
  },
  syncNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  syncNowBtnDisabled: {
    backgroundColor: '#94a3b8',
  },
  syncNowBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#fff',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: Palette.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.textSecondary,
  },
  tabTextActive: {
    color: Palette.primary,
  },
  contentScroll: {
    padding: 16,
  },
  quickActionsCard: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Palette.primary,
    gap: 4,
  },
  actionPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.primary,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 36,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    marginTop: 12,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.textPrimary,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 12,
    color: Palette.textSecondary,
    marginTop: 4,
  },
  mutationCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  mutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  mutType: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.textPrimary,
    marginLeft: 6,
  },
  actionBadge: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  actionBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Palette.primary,
  },
  timeAgo: {
    fontSize: 11,
    color: Palette.textSecondary,
  },
  mutPayload: {
    fontSize: 13,
    color: Palette.textPrimary,
    marginBottom: 8,
    fontWeight: '500',
  },
  mutFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 6,
  },
  idempotencyText: {
    fontSize: 10,
    color: '#94a3b8',
    fontFamily: 'monospace',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusPillText: {
    fontSize: 11,
    color: '#f59e0b',
    fontWeight: '600',
  },
  conflictCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#fed7aa',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  conflictHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  conflictEntity: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.textPrimary,
    marginLeft: 6,
  },
  strategyPill: {
    backgroundColor: '#ffedd5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  strategyPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#c2410c',
  },
  conflictGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  conflictCol: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: 8,
  },
  colLabel: {
    fontSize: 10,
    color: Palette.textSecondary,
    fontWeight: '600',
  },
  colVal: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.textPrimary,
    marginTop: 2,
  },
  subCol: {
    fontSize: 10,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  conflictTime: {
    fontSize: 10,
    color: '#94a3b8',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 6,
  },
  statusCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statusCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.textPrimary,
    marginBottom: 12,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  metricLabel: {
    fontSize: 13,
    color: Palette.textSecondary,
  },
  metricVal: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  clearOutboxBtn: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearOutboxBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.danger,
  },
});
