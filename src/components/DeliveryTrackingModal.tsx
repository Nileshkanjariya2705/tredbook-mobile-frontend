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
  Linking,
} from 'react-native';
import { Palette } from '../theme/colors';
import {
  deliveryService,
  DeliveryDriver,
  OrderDeliveryTracking,
} from '../services/deliveryService';
import { useLanguage } from '../context/LanguageContext';
import {
  Truck,
  Navigation,
  Phone,
  ShieldCheck,
  Clock,
  MapPin,
  CheckCircle2,
  X,
  UserCheck,
  RotateCcw,
} from 'lucide-react-native';

interface DeliveryTrackingModalProps {
  visible: boolean;
  orderId?: string;
  onClose: () => void;
}

export const DeliveryTrackingModal: React.FC<DeliveryTrackingModalProps> = ({
  visible,
  orderId = 'ORD-2026-8812',
  onClose,
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'TRACKING' | 'FLEET'>('TRACKING');
  const [tracking, setTracking] = useState<OrderDeliveryTracking | null>(null);
  const [drivers, setDrivers] = useState<DeliveryDriver[]>([]);
  const [loading, setLoading] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [simulatingMove, setSimulatingMove] = useState(false);

  useEffect(() => {
    if (visible) {
      loadData();
    }
  }, [visible, orderId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [trackData, fleetData] = await Promise.all([
        deliveryService.getOrderTracking(orderId).catch(() => null),
        deliveryService.getAvailableDrivers().catch(() => ({ totalDrivers: 0, availableDrivers: [] })),
      ]);

      if (trackData) setTracking(trackData);
      if (fleetData?.availableDrivers) setDrivers(fleetData.availableDrivers);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const handleAssignDriver = async (driverId: number) => {
    try {
      setLoading(true);
      const res = await deliveryService.assignDriver(orderId, driverId);
      Alert.alert('Rider Assigned', res.message);
      setActiveTab('TRACKING');
      loadData();
    } catch (err: any) {
      Alert.alert('Assignment Error', err?.response?.data?.message || 'Could not assign rider');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpInput.trim()) {
      Alert.alert('Required', 'Please enter customer 4-digit Delivery OTP.');
      return;
    }
    setVerifying(true);
    try {
      const res = await deliveryService.completeDelivery(orderId, otpInput.trim());
      Alert.alert('Order Delivered', res.message);
      setOtpInput('');
      loadData();
    } catch (err: any) {
      Alert.alert('Invalid OTP', err?.response?.data?.message || 'Invalid Handover OTP entered.');
    } finally {
      setVerifying(false);
    }
  };

  const handleSimulateRiderMovement = async () => {
    if (!tracking?.driver?.id) return;
    setSimulatingMove(true);
    try {
      // Slightly alter coordinates towards destination
      const nextLat = tracking.driver.currentLocation.lat + 0.002;
      const nextLng = tracking.driver.currentLocation.lng + 0.002;
      await deliveryService.updateDriverLocation(
        tracking.driver.id,
        nextLat,
        nextLng,
        'Approaching Customer Destination'
      );
      loadData();
    } catch {
      // ignore
    } finally {
      setSimulatingMove(false);
    }
  };

  const handleCallDriver = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('Phone Call', `Dialing ${phone}`);
    });
  };

  const renderStepper = () => {
    const steps = ['CONFIRMED', 'PROCESSING', 'DISPATCHED', 'FULFILLED'];
    const currentIdx = steps.indexOf(tracking?.status || 'PROCESSING');

    return (
      <View style={styles.stepperContainer}>
        {steps.map((st, idx) => {
          const isDone = idx <= currentIdx;
          const isCurrent = idx === currentIdx;

          return (
            <View key={st} style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  isDone && styles.stepCircleDone,
                  isCurrent && styles.stepCircleCurrent,
                ]}
              >
                {isDone ? (
                  <CheckCircle2 size={14} color="#fff" />
                ) : (
                  <Text style={styles.stepNum}>{idx + 1}</Text>
                )}
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  isDone && styles.stepLabelDone,
                  isCurrent && styles.stepLabelCurrent,
                ]}
                numberOfLines={1}
              >
                {st.replace('_', ' ')}
              </Text>
              {idx < steps.length - 1 && (
                <View style={[styles.stepLine, idx < currentIdx && styles.stepLineDone]} />
              )}
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Truck size={22} color={Palette.primary} />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.headerTitle}>{t.deliveryTracking}</Text>
                <Text style={styles.headerSubtitle}>Order #{orderId}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <X size={20} color={Palette.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Tab Switcher */}
          <View style={styles.tabsRow}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'TRACKING' && styles.tabBtnActive]}
              onPress={() => setActiveTab('TRACKING')}
            >
              <Text style={[styles.tabText, activeTab === 'TRACKING' && styles.tabTextActive]}>
                📍 Live Route
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'FLEET' && styles.tabBtnActive]}
              onPress={() => setActiveTab('FLEET')}
            >
              <Text style={[styles.tabText, activeTab === 'FLEET' && styles.tabTextActive]}>
                🛵 Fleet Dispatch ({drivers.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Body Content */}
          <ScrollView style={styles.contentScroll} contentContainerStyle={{ paddingBottom: 24 }}>
            {activeTab === 'TRACKING' && (
              <View>
                {/* Stepper */}
                {renderStepper()}

                {/* Live Tracking Telemetry Card */}
                <View style={styles.telemetryCard}>
                  <View style={styles.telemetryHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Navigation size={18} color={Palette.primary} />
                      <Text style={styles.telemetryTitle}>
                        {tracking?.status === 'FULFILLED'
                          ? t.orderDelivered
                          : tracking?.status === 'DISPATCHED'
                          ? t.outForDelivery
                          : 'Order In Kitchen / Warehouse'}
                      </Text>
                    </View>
                    <View style={styles.etaPill}>
                      <Clock size={12} color="#fff" />
                      <Text style={styles.etaPillText}>
                        {tracking?.status === 'FULFILLED'
                          ? 'Delivered'
                          : `${tracking?.etaMinutes || 20} mins`}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.telemetryRow}>
                    <MapPin size={16} color={Palette.textSecondary} />
                    <Text style={styles.telemetryArea}>
                      {tracking?.driver?.currentLocation?.area || 'Near Customer Sector'}
                    </Text>
                  </View>

                  <Text style={styles.telemetryDistance}>
                    Remaining Distance: ~{tracking?.distanceKm || 1.8} km
                  </Text>

                  {/* Simulate Rider Progress Button */}
                  {tracking?.status === 'DISPATCHED' && (
                    <TouchableOpacity
                      style={styles.simulateBtn}
                      onPress={handleSimulateRiderMovement}
                      disabled={simulatingMove}
                      activeOpacity={0.7}
                    >
                      <RotateCcw size={14} color={Palette.primary} />
                      <Text style={styles.simulateBtnText}>Simulate GPS Telemetry Pulse</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Driver Profile Card */}
                {tracking?.driver && (
                  <View style={styles.driverCard}>
                    <View style={styles.driverInfoRow}>
                      <View style={styles.driverAvatar}>
                        <UserCheck size={24} color={Palette.primary} />
                      </View>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.driverName}>{tracking.driver.name}</Text>
                        <Text style={styles.driverVehicle}>
                          {tracking.driver.vehicleNumber} • {tracking.driver.vehicleType}
                        </Text>
                        <Text style={styles.driverRating}>★ {tracking.driver.rating} Rating</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.callBtn}
                        onPress={() => handleCallDriver(tracking.driver.phone)}
                        activeOpacity={0.7}
                      >
                        <Phone size={16} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Customer Proof-of-Delivery OTP Banner */}
                <View style={styles.otpBanner}>
                  <ShieldCheck size={22} color={Palette.mintDark} />
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={styles.otpTitle}>{t.deliveryOtp}</Text>
                    <Text style={styles.otpDesc}>Share with delivery rider upon order arrival</Text>
                  </View>
                  <View style={styles.otpBox}>
                    <Text style={styles.otpCode}>{tracking?.deliveryOtp || '----'}</Text>
                  </View>
                </View>

                {/* Driver Handover Verification Desk (For Delivery Rider / Merchant) */}
                {tracking?.status === 'DISPATCHED' && (
                  <View style={styles.handoverCard}>
                    <Text style={styles.handoverTitle}>{t.handoverProof}</Text>
                    <Text style={styles.handoverSubtitle}>
                      Verify customer 4-digit code to complete delivery
                    </Text>

                    <View style={styles.verifyRow}>
                      <TextInput
                        style={styles.otpInput}
                        placeholder="Enter 4-digit OTP"
                        placeholderTextColor={Palette.textSecondary}
                        keyboardType="number-pad"
                        maxLength={4}
                        value={otpInput}
                        onChangeText={setOtpInput}
                      />
                      <TouchableOpacity
                        style={[styles.verifyBtn, verifying && styles.verifyBtnDisabled]}
                        onPress={handleVerifyOtp}
                        disabled={verifying}
                        activeOpacity={0.7}
                      >
                        {verifying ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Text style={styles.verifyBtnText}>Confirm Delivery</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            )}

            {activeTab === 'FLEET' && (
              <View>
                <Text style={styles.fleetHeaderTitle}>Assign Available Delivery Rider</Text>
                <Text style={styles.fleetHeaderSubtitle}>
                  Order #{orderId} will be handed over with secure OTP verification
                </Text>

                {drivers.map((drv) => (
                  <View key={drv.id} style={styles.fleetCard}>
                    <View style={styles.fleetCardHeader}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <UserCheck size={18} color={Palette.primary} />
                        <Text style={styles.fleetName}>{drv.name}</Text>
                      </View>
                      <View style={styles.fleetStatusPill}>
                        <Text style={styles.fleetStatusPillText}>{drv.status}</Text>
                      </View>
                    </View>

                    <Text style={styles.fleetDetails}>
                      Vehicle: {drv.vehicleNumber} ({drv.vehicleType})
                    </Text>
                    <Text style={styles.fleetArea}>Current Zone: {drv.currentLocation.area}</Text>
                    <Text style={styles.fleetDeliveries}>
                      Total Fulfilled: {drv.totalDeliveries} orders • ★ {drv.rating}
                    </Text>

                    <TouchableOpacity
                      style={styles.assignBtn}
                      onPress={() => handleAssignDriver(drv.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.assignBtnText}>Assign to Order #{orderId.slice(-4)}</Text>
                    </TouchableOpacity>
                  </View>
                ))}
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
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    zIndex: 2,
  },
  stepCircleDone: {
    backgroundColor: Palette.mintDark,
  },
  stepCircleCurrent: {
    backgroundColor: Palette.primary,
  },
  stepNum: {
    fontSize: 10,
    fontWeight: '700',
    color: Palette.textSecondary,
  },
  stepLabel: {
    fontSize: 9,
    color: Palette.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  stepLabelDone: {
    color: Palette.mintDark,
  },
  stepLabelCurrent: {
    color: Palette.primary,
    fontWeight: '700',
  },
  stepLine: {
    position: 'absolute',
    top: 12,
    left: '50%',
    right: '-50%',
    height: 2,
    backgroundColor: '#e2e8f0',
    zIndex: 1,
  },
  stepLineDone: {
    backgroundColor: Palette.mintDark,
  },
  telemetryCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
  },
  telemetryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  telemetryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.textPrimary,
    marginLeft: 6,
  },
  etaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  etaPillText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  telemetryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  telemetryArea: {
    fontSize: 12,
    color: Palette.textSecondary,
    marginLeft: 6,
  },
  telemetryDistance: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.mintDark,
    marginTop: 6,
  },
  simulateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    gap: 6,
  },
  simulateBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: Palette.primary,
  },
  driverCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  driverInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverName: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  driverVehicle: {
    fontSize: 12,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  driverRating: {
    fontSize: 11,
    fontWeight: '600',
    color: '#f59e0b',
    marginTop: 2,
  },
  callBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Palette.mintDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  otpTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.mintDark,
  },
  otpDesc: {
    fontSize: 11,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  otpBox: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Palette.mintDark,
  },
  otpCode: {
    fontSize: 16,
    fontWeight: '800',
    color: Palette.mintDark,
    letterSpacing: 2,
  },
  handoverCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
  },
  handoverTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  handoverSubtitle: {
    fontSize: 11,
    color: Palette.textSecondary,
    marginTop: 2,
    marginBottom: 10,
  },
  verifyRow: {
    flexDirection: 'row',
    gap: 8,
  },
  otpInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
    color: Palette.textPrimary,
  },
  verifyBtn: {
    backgroundColor: Palette.primary,
    paddingHorizontal: 14,
    borderRadius: 8,
    justifyContent: 'center',
  },
  verifyBtnDisabled: {
    backgroundColor: '#94a3b8',
  },
  verifyBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  fleetHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.textPrimary,
    marginBottom: 2,
  },
  fleetHeaderSubtitle: {
    fontSize: 12,
    color: Palette.textSecondary,
    marginBottom: 14,
  },
  fleetCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  fleetCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  fleetName: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.textPrimary,
    marginLeft: 6,
  },
  fleetStatusPill: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  fleetStatusPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803d',
  },
  fleetDetails: {
    fontSize: 12,
    color: Palette.textPrimary,
    marginBottom: 2,
  },
  fleetArea: {
    fontSize: 11,
    color: Palette.textSecondary,
    marginBottom: 2,
  },
  fleetDeliveries: {
    fontSize: 11,
    color: Palette.mintDark,
    fontWeight: '600',
    marginBottom: 10,
  },
  assignBtn: {
    backgroundColor: Palette.primary,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  assignBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});
