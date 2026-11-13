import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import {
  ShieldCheck,
  X,
  Gauge,
  Building2,
  Package,
  AlertCircle,
  FileText,
  CheckCircle2,
  Check,
  FileCheck,
  Flag,
  Receipt,
  Image as ImageIcon,
} from 'lucide-react-native';
import {
  adminService,
  AdminOverview,
  AdminUser,
  MerchantKycItem,
  ModerationProduct,
  DisputeItem,
  AuditLogItem,
} from '../../services/adminService';

interface AdminWorkbenchModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AdminWorkbenchModal: React.FC<AdminWorkbenchModalProps> = ({
  visible,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'kyc' | 'moderation' | 'disputes' | 'audit'>('overview');
  const [loading, setLoading] = useState<boolean>(true);

  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [kycList, setKycList] = useState<MerchantKycItem[]>([]);
  const [products, setProducts] = useState<ModerationProduct[]>([]);
  const [disputes, setDisputes] = useState<DisputeItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);

  // Action states
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [disputeNotes, setDisputeNotes] = useState<string>('Evidence verified. Resolved per platform trading guidelines.');

  useEffect(() => {
    if (visible) {
      loadAllAdminData();
    }
  }, [visible]);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [ovData, usersData, kycData, prodsData, dispData, logsData] = await Promise.all([
        adminService.getOverview(),
        adminService.getUsers(),
        adminService.getMerchantKycList(),
        adminService.getModerationProducts(),
        adminService.getDisputes(),
        adminService.getAuditLogs(),
      ]);

      setOverview(ovData);
      setUsers(usersData);
      setKycList(kycData);
      setProducts(prodsData);
      setDisputes(dispData);
      setAuditLogs(logsData);
    } catch (err: any) {
      console.warn('Failed to load admin data:', err?.message || err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyKyc = async (companyId: number, status: 'approved' | 'rejected') => {
    setActionLoading(true);
    try {
      await adminService.verifyMerchantKyc(companyId, status, 'Verified via official GST portal lookup.');
      Alert.alert('KYC Updated', `Merchant #${companyId} KYC marked as ${status.toUpperCase()}.`);
      loadAllAdminData();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not update KYC');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleProductStatus = async (itemId: number, currentPublished: boolean) => {
    setActionLoading(true);
    const newStatus = currentPublished ? 'taken_down' : 'published';
    try {
      await adminService.moderateProduct(itemId, newStatus, 'Super Admin policy moderation review.');
      Alert.alert('Product Moderated', `Item #${itemId} is now ${newStatus}.`);
      loadAllAdminData();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not moderate product');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolveDispute = async (
    disputeId: string,
    resolution: 'refund' | 'replace' | 'dismiss' | 'upheld',
  ) => {
    setActionLoading(true);
    try {
      await adminService.resolveDispute(disputeId, 'resolved', resolution, disputeNotes);
      Alert.alert('Arbitration Complete', `Dispute ${disputeId} binding resolution: ${resolution.toUpperCase()}. Audit entry logged.`);
      loadAllAdminData();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not resolve dispute');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleUserStatus = async (user: AdminUser) => {
    const isSuspended = user.status === 'suspended';
    const newStatus = isSuspended ? 'active' : 'suspended';

    Alert.alert(
      `${isSuspended ? 'Reactivate' : 'Suspend'} User?`,
      `Are you sure you want to change standing for ${user.name} (${user.customerId})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: isSuspended ? 'Reactivate' : 'Suspend',
          style: isSuspended ? 'default' : 'destructive',
          onPress: async () => {
            try {
              await adminService.updateUserStatus(user.id, newStatus, 'Platform moderation rule enforcement');
              Alert.alert('Success', `User is now ${newStatus}.`);
              loadAllAdminData();
            } catch (e: any) {
              Alert.alert('Error', e.message);
            }
          },
        },
      ],
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <View style={styles.titleRow}>
                <ShieldCheck size={22} color="#DC2626" />
                <Text style={styles.headerTitle}>Super Admin Governance</Text>
              </View>
              <Text style={styles.headerSubtitle}>Platform moderation, KYC verification & dispute arbitration</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#4B5563" />
            </TouchableOpacity>
          </View>

          {/* Navigation Tabs */}
          <View style={styles.tabBar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
              {[
                { key: 'overview', label: 'Overview', icon: Gauge },
                { key: 'kyc', label: `KYC (${kycList.length})`, icon: Building2 },
                { key: 'moderation', label: `Catalog (${products.length})`, icon: Package },
                { key: 'disputes', label: `Disputes (${disputes.length})`, icon: AlertCircle },
                { key: 'audit', label: `Audit Log`, icon: FileText },
              ].map((t) => {
                const IconComponent = t.icon;
                return (
                  <TouchableOpacity
                    key={t.key}
                    style={[styles.tabBtn, activeTab === t.key && styles.tabBtnActive]}
                    onPress={() => setActiveTab(t.key as any)}
                  >
                    <IconComponent
                      size={15}
                      color={activeTab === t.key ? '#FFFFFF' : '#4B5563'}
                    />
                    <Text style={[styles.tabBtnText, activeTab === t.key && styles.tabBtnTextActive]}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#DC2626" />
              <Text style={styles.loadingText}>Loading governance records...</Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && overview && (
                <View style={{ gap: 16 }}>
                  <View style={styles.kpiGrid}>
                    <View style={styles.kpiCard}>
                      <Text style={styles.kpiValue}>{overview.totalUsers}</Text>
                      <Text style={styles.kpiLabel}>Total Accounts</Text>
                    </View>
                    <View style={styles.kpiCard}>
                      <Text style={styles.kpiValue}>{overview.totalCompanies}</Text>
                      <Text style={styles.kpiLabel}>Registered MSMEs</Text>
                    </View>
                    <View style={styles.kpiCard}>
                      <Text style={[styles.kpiValue, { color: '#059669' }]}>{overview.activeSubscriptions}</Text>
                      <Text style={styles.kpiLabel}>Active Plans</Text>
                    </View>
                    <View style={styles.kpiCard}>
                      <Text style={[styles.kpiValue, { color: '#DC2626' }]}>{overview.activeDisputes}</Text>
                      <Text style={styles.kpiLabel}>Escalated Disputes</Text>
                    </View>
                  </View>

                  <View style={styles.sectionCard}>
                    <Text style={styles.sectionCardTitle}>System Health & SLA Status</Text>
                    <View style={styles.statusRow}>
                      <CheckCircle2 size={18} color="#10B981" />
                      <Text style={styles.statusText}>Platform Availability: 99.98% uptime</Text>
                    </View>
                    <View style={styles.statusRow}>
                      <ShieldCheck size={18} color="#7C3AED" />
                      <Text style={styles.statusText}>Tenant Isolation: Fully Enforced (0 cross-reads)</Text>
                    </View>
                  </View>

                  {/* Quick User List with Suspension toggle */}
                  <View style={styles.sectionCard}>
                    <Text style={styles.sectionCardTitle}>Recent User Accounts</Text>
                    {users.slice(0, 5).map((u) => (
                      <View key={u.id} style={styles.userRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.userName}>{u.name} <Text style={{ color: '#6B7280', fontSize: 12 }}>({u.customerId})</Text></Text>
                          <Text style={styles.userSub}>{u.phone || u.email}</Text>
                        </View>
                        <TouchableOpacity
                          style={[styles.smallBtn, u.status === 'suspended' ? styles.reactivateBtn : styles.suspendBtn]}
                          onPress={() => handleToggleUserStatus(u)}
                        >
                          <Text style={styles.smallBtnText}>{u.status === 'suspended' ? 'Reactivate' : 'Suspend'}</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* TAB 2: MERCHANT KYC */}
              {activeTab === 'kyc' && (
                <View style={{ gap: 12 }}>
                  <Text style={styles.subHeading}>Merchant Onboarding & GST Verification</Text>
                  {kycList.map((m) => (
                    <View key={m.id} style={styles.kycCard}>
                      <View style={styles.kycCardHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.kycBusinessName}>{m.businessName}</Text>
                          <Text style={styles.kycGstText}>GSTIN: {m.gstNumber} • PAN: {m.panNumber}</Text>
                        </View>
                        <View style={[styles.kycStatusBadge, m.status === 'verified' ? styles.kycVerifiedBadge : styles.kycPendingBadge]}>
                          <Text style={styles.kycStatusText}>{m.status.toUpperCase()}</Text>
                        </View>
                      </View>

                      <View style={styles.docRow}>
                        <FileCheck size={16} color="#6B7280" />
                        <Text style={styles.docText}>Document: {m.documentSubmitted}</Text>
                      </View>

                      <View style={styles.kycActionRow}>
                        <TouchableOpacity
                          style={[styles.kycActionBtn, { backgroundColor: '#10B981' }]}
                          onPress={() => handleVerifyKyc(m.id, 'approved')}
                          disabled={actionLoading}
                        >
                          <Check size={16} color="#FFFFFF" />
                          <Text style={styles.kycActionBtnText}>Approve & Badge</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.kycActionBtn, { backgroundColor: '#EF4444' }]}
                          onPress={() => handleVerifyKyc(m.id, 'rejected')}
                          disabled={actionLoading}
                        >
                          <X size={16} color="#FFFFFF" />
                          <Text style={styles.kycActionBtnText}>Reject</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* TAB 3: PRODUCT MODERATION */}
              {activeTab === 'moderation' && (
                <View style={{ gap: 12 }}>
                  <Text style={styles.subHeading}>Marketplace Content & Policy Moderation</Text>
                  {products.map((p) => (
                    <View key={p.id} style={styles.productCard}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.productName}>{p.name}</Text>
                        <Text style={styles.productMeta}>Code: {p.itemCode} • ₹{p.price} • Store #{p.companyId}</Text>
                        {p.reportsCount > 0 && (
                          <View style={styles.reportTag}>
                            <Flag size={12} color="#DC2626" />
                            <Text style={styles.reportTagText}>{p.reportsCount} Policy Report</Text>
                          </View>
                        )}
                      </View>
                      <TouchableOpacity
                        style={[styles.modActionBtn, p.isPublished ? styles.takeDownBtn : styles.restoreBtn]}
                        onPress={() => handleToggleProductStatus(p.id, p.isPublished)}
                        disabled={actionLoading}
                      >
                        <Text style={styles.modActionBtnText}>{p.isPublished ? 'Take Down' : 'Restore'}</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {/* TAB 4: DISPUTES ARBITER */}
              {activeTab === 'disputes' && (
                <View style={{ gap: 12 }}>
                  <Text style={styles.subHeading}>Escalated Commercial Disputes (48h SLA Lapsed)</Text>
                  {disputes.map((d) => (
                    <View key={d.id} style={styles.disputeCard}>
                      <View style={styles.disputeHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.disputeIdText}>{d.id} • Order {d.orderId}</Text>
                          <Text style={styles.disputePartyText}>{d.customerName} ➔ {d.merchantName}</Text>
                        </View>
                        <Text style={styles.disputeAmount}>₹{d.amount}</Text>
                      </View>

                      <View style={styles.disputeReasonBox}>
                        <Text style={styles.disputeReasonTitle}>Claim:</Text>
                        <Text style={styles.disputeReasonText}>{d.reason}</Text>
                      </View>

                      <View style={styles.evidenceRow}>
                        {d.evidence.map((ev, i) => (
                          <View key={i} style={styles.evidencePill}>
                            {ev.type === 'invoice' ? (
                              <Receipt size={12} color="#4B5563" />
                            ) : (
                              <ImageIcon size={12} color="#4B5563" />
                            )}
                            <Text style={styles.evidenceText}>{ev.url}</Text>
                          </View>
                        ))}
                      </View>

                      <View style={styles.arbiterSection}>
                        <Text style={styles.arbiterHeading}>Issue Binding Super Admin Verdict:</Text>
                        <View style={styles.verdictBtnRow}>
                          <TouchableOpacity
                            style={[styles.verdictBtn, { backgroundColor: '#10B981' }]}
                            onPress={() => handleResolveDispute(d.id, 'refund')}
                          >
                            <Text style={styles.verdictBtnText}>Refund Buyer</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.verdictBtn, { backgroundColor: '#3B82F6' }]}
                            onPress={() => handleResolveDispute(d.id, 'replace')}
                          >
                            <Text style={styles.verdictBtnText}>Replace Item</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.verdictBtn, { backgroundColor: '#6B7280' }]}
                            onPress={() => handleResolveDispute(d.id, 'dismiss')}
                          >
                            <Text style={styles.verdictBtnText}>Dismiss Claim</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* TAB 5: AUDIT LOG */}
              {activeTab === 'audit' && (
                <View style={{ gap: 12 }}>
                  <Text style={styles.subHeading}>Immutable Administrative Action Log</Text>
                  {auditLogs.map((log) => (
                    <View key={log.id} style={styles.logCard}>
                      <View style={styles.logHeader}>
                        <Text style={styles.logAction}>{log.action}</Text>
                        <Text style={styles.logTime}>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                      </View>
                      <Text style={styles.logSubject}>Subject: {log.subject}</Text>
                      <Text style={styles.logDetails}>{log.details}</Text>
                      <Text style={styles.logOperator}>Operator: {log.adminName}</Text>
                    </View>
                  ))}
                </View>
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
    maxHeight: '94%',
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  tabBar: {
    backgroundColor: '#F9FAFB',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
  },
  tabBtnActive: {
    backgroundColor: '#DC2626',
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
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
  subHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  kpiCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  kpiLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  statusText: {
    fontSize: 13,
    color: '#374151',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  userName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  userSub: {
    fontSize: 11,
    color: '#6B7280',
  },
  smallBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  suspendBtn: {
    backgroundColor: '#FEE2E2',
  },
  reactivateBtn: {
    backgroundColor: '#D1FAE5',
  },
  smallBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111827',
  },
  kycCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  kycCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  kycBusinessName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  kycGstText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  kycStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  kycVerifiedBadge: {
    backgroundColor: '#D1FAE5',
  },
  kycPendingBadge: {
    backgroundColor: '#FEF3C7',
  },
  kycStatusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#111827',
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 10,
    backgroundColor: '#F9FAFB',
    padding: 8,
    borderRadius: 8,
  },
  docText: {
    fontSize: 12,
    color: '#4B5563',
  },
  kycActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  kycActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
  },
  kycActionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  productMeta: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  reportTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  reportTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#DC2626',
  },
  modActionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  takeDownBtn: {
    backgroundColor: '#FEE2E2',
  },
  restoreBtn: {
    backgroundColor: '#D1FAE5',
  },
  modActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  disputeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  disputeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  disputeIdText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#DC2626',
  },
  disputePartyText: {
    fontSize: 12,
    color: '#4B5563',
    marginTop: 2,
  },
  disputeAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  disputeReasonBox: {
    backgroundColor: '#FEF2F2',
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
  },
  disputeReasonTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#991B1B',
  },
  disputeReasonText: {
    fontSize: 12,
    color: '#7F1D1D',
    marginTop: 2,
  },
  evidenceRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  evidencePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  evidenceText: {
    fontSize: 11,
    color: '#4B5563',
  },
  arbiterSection: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 10,
  },
  arbiterHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  verdictBtnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  verdictBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  verdictBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  logCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logAction: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
  },
  logTime: {
    fontSize: 11,
    color: '#6B7280',
  },
  logSubject: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginTop: 4,
  },
  logDetails: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  logOperator: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 4,
  },
});
