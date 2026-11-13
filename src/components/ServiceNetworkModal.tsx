import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import {
  Wrench,
  Zap,
  Droplet,
  Smartphone,
  Tv,
  Home,
  Sparkles,
  Video,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Star,
  X,
  KeyRound,
  Award,
  PhoneCall,
  Check,
  Calendar,
} from 'lucide-react-native';
import {
  serviceNetworkService,
  ServiceCategory,
  ServiceProvider,
  ServiceBooking,
} from '../services/serviceNetworkService';
import { useLanguage } from '../context/LanguageContext';

interface ServiceNetworkModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ServiceNetworkModal: React.FC<ServiceNetworkModalProps> = ({ visible, onClose }) => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'DISCOVER' | 'BOOKINGS'>('DISCOVER');
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [bookings, setBookings] = useState<ServiceBooking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Enquiry modal state
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [description, setDescription] = useState<string>('');
  const [preferredSlot, setPreferredSlot] = useState<string>('MORNING');
  const [submittingEnquiry, setSubmittingEnquiry] = useState<boolean>(false);

  // OTP sign-off simulation state
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [completingBookingId, setCompletingBookingId] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      loadData();
    }
  }, [visible, selectedCategory]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cats, provs, userBookings] = await Promise.all([
        serviceNetworkService.getCategories(),
        serviceNetworkService.getProviders(selectedCategory === 'all' ? undefined : selectedCategory),
        serviceNetworkService.getCustomerBookings(),
      ]);
      setCategories(cats);
      setProviders(provs);
      setBookings(userBookings);
    } catch (err: any) {
      console.error('Failed to load services network data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEnquiry = async () => {
    if (!selectedProvider) return;
    if (!description.trim()) {
      Alert.alert('Required', 'Please describe the issue or symptom.');
      return;
    }

    try {
      setSubmittingEnquiry(true);
      const newEnquiry = await serviceNetworkService.createEnquiry({
        providerId: selectedProvider.id,
        categoryId: selectedProvider.categoryId,
        symptomChecklist: ['General Inspection Required'],
        description: description.trim(),
        preferredTimeSlot: preferredSlot,
        address: 'Ahmedabad, Gujarat',
      });

      Alert.alert(
        'Enquiry Sent 📋',
        `Your request #${newEnquiry.id} was delivered to ${selectedProvider.name}. They will review and issue an itemized quotation.`
      );
      setSelectedProvider(null);
      setDescription('');
      setActiveTab('BOOKINGS');
      loadData();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to submit enquiry';
      Alert.alert(t.error, msg);
    } finally {
      setSubmittingEnquiry(false);
    }
  };

  const handleConfirmQuote = async (enquiryId: string) => {
    try {
      setLoading(true);
      const confirmed = await serviceNetworkService.confirmBooking(enquiryId);
      Alert.alert(
        'Appointment Confirmed! 📅',
        `Technician scheduled. Your Job Sheet Completion OTP is ${confirmed.completionOtp}. Share this only after service is completed.`
      );
      loadData();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to confirm quote';
      Alert.alert(t.error, msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteJobWithOtp = async (booking: ServiceBooking) => {
    if (!enteredOtp.trim()) {
      Alert.alert('OTP Required', 'Enter the 4-digit customer completion OTP.');
      return;
    }

    try {
      setLoading(true);
      const completed = await serviceNetworkService.updateBookingStatus(
        booking.id,
        'COMPLETED',
        enteredOtp.trim()
      );
      Alert.alert(
        'Job Completed & Signed Off! ✅',
        `Service sign-off verified! Issued 90-day warranty passport: ${completed.warrantyPassportCode}.`
      );
      setCompletingBookingId(null);
      setEnteredOtp('');
      loadData();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to complete job';
      Alert.alert('OTP Verification Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap':
        return <Zap size={18} color="#D97706" />;
      case 'Droplet':
        return <Droplet size={18} color="#0284C7" />;
      case 'Wrench':
        return <Wrench size={18} color="#475569" />;
      case 'AirVent':
        return <Sparkles size={18} color="#059669" />;
      case 'Smartphone':
        return <Smartphone size={18} color="#7C3AED" />;
      case 'Tv':
        return <Tv size={18} color="#DC2626" />;
      case 'Home':
        return <Home size={18} color="#2563EB" />;
      case 'Sparkles':
        return <Sparkles size={18} color="#D97706" />;
      case 'Video':
        return <Video size={18} color="#0891B2" />;
      default:
        return <Wrench size={18} color="#475569" />;
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.iconCircle}>
                <Wrench size={20} color="#2563EB" />
              </View>
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.headerTitle}>{t.servicesHub}</Text>
                <Text style={styles.headerSubtitle}>{t.servicesSubtitle}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Top Switcher Tabs */}
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'DISCOVER' && styles.tabBtnActive]}
              onPress={() => setActiveTab('DISCOVER')}
            >
              <Text style={[styles.tabBtnText, activeTab === 'DISCOVER' && styles.tabBtnTextActive]}>
                🔍 Find Technicians
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'BOOKINGS' && styles.tabBtnActive]}
              onPress={() => setActiveTab('BOOKINGS')}
            >
              <Text style={[styles.tabBtnText, activeTab === 'BOOKINGS' && styles.tabBtnTextActive]}>
                📋 Active Bookings ({bookings.length})
              </Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loaderWrap}>
              <ActivityIndicator size="large" color="#2563EB" />
              <Text style={styles.loaderText}>{t.loading}</Text>
            </View>
          ) : activeTab === 'DISCOVER' ? (
            <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
              {/* Category Pills Carousel */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryPillRow}
              >
                <TouchableOpacity
                  style={[styles.catPill, selectedCategory === 'all' && styles.catPillActive]}
                  onPress={() => setSelectedCategory('all')}
                >
                  <Text style={[styles.catPillText, selectedCategory === 'all' && styles.catPillTextActive]}>
                    All Trades
                  </Text>
                </TouchableOpacity>

                {categories.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.catPill, selectedCategory === c.id && styles.catPillActive]}
                    onPress={() => setSelectedCategory(c.id)}
                  >
                    <Text
                      style={[
                        styles.catPillText,
                        selectedCategory === c.id && styles.catPillTextActive,
                      ]}
                    >
                      {language === 'hi' ? c.nameHindi : c.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Providers List */}
              <View style={styles.providersList}>
                {providers.map((p) => (
                  <View key={p.id} style={styles.providerCard}>
                    <View style={styles.providerTop}>
                      <View style={{ flex: 1 }}>
                        <View style={styles.providerTitleRow}>
                          <Text style={styles.providerName}>{p.name}</Text>
                          {p.isGstVerified && (
                            <View style={styles.verifiedTag}>
                              <ShieldCheck size={12} color="#16A34A" />
                              <Text style={styles.verifiedTagText}>GST</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.providerTrade}>{p.trade}</Text>
                      </View>
                      <View style={styles.trustScoreTag}>
                        <Star size={12} color="#D97706" fill="#D97706" />
                        <Text style={styles.trustScoreText}>{p.rating}★</Text>
                      </View>
                    </View>

                    <View style={styles.providerMetaRow}>
                      <View style={styles.metaItem}>
                        <MapPin size={12} color="#64748B" />
                        <Text style={styles.metaText}>{p.distanceKm} km away</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Clock size={12} color="#64748B" />
                        <Text style={styles.metaText}>{p.experienceYears}y exp</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Text style={styles.feeHighlight}>₹{p.inspectionFee} Fee</Text>
                      </View>
                    </View>

                    <View style={styles.cardActionsRow}>
                      <TouchableOpacity
                        style={styles.bookBtn}
                        onPress={() => setSelectedProvider(p)}
                      >
                        <Wrench size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                        <Text style={styles.bookBtnText}>{t.requestQuote}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          ) : (
            <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
              {/* Active Bookings List */}
              {bookings.length === 0 ? (
                <View style={styles.emptyWrap}>
                  <Text style={styles.emptyText}>No service bookings found.</Text>
                </View>
              ) : (
                bookings.map((b) => (
                  <View key={b.id} style={styles.bookingCard}>
                    <View style={styles.bookingHeader}>
                      <View>
                        <Text style={styles.bookingId}>Request #{b.id}</Text>
                        <Text style={styles.bookingDesc}>{b.description}</Text>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          b.status === 'COMPLETED'
                            ? styles.statusCompleted
                            : b.status === 'BOOKING_CONFIRMED'
                            ? styles.statusConfirmed
                            : styles.statusEnquiry,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            b.status === 'COMPLETED'
                              ? styles.statusTextCompleted
                              : b.status === 'BOOKING_CONFIRMED'
                              ? styles.statusTextConfirmed
                              : styles.statusTextEnquiry,
                          ]}
                        >
                          {b.status.replace('_', ' ')}
                        </Text>
                      </View>
                    </View>

                    {/* Quotation Details (if offered) */}
                    {b.quotation && (
                      <View style={styles.quoteBox}>
                        <Text style={styles.quoteTitle}>Itemized Quotation:</Text>
                        <View style={styles.quoteMathRow}>
                          <Text style={styles.quoteMathItem}>Inspection: ₹{b.quotation.inspectionFee}</Text>
                          <Text style={styles.quoteMathItem}>Labor: ₹{b.quotation.laborCharge}</Text>
                          <Text style={styles.quoteMathItem}>Parts: ₹{b.quotation.estimatedPartsCost}</Text>
                        </View>
                        <Text style={styles.quoteTotal}>
                          Total Estimate: ₹{b.quotation.totalEstimatedAmount}
                        </Text>

                        {b.status === 'QUOTATION_OFFERED' && (
                          <TouchableOpacity
                            style={styles.confirmQuoteBtn}
                            onPress={() => handleConfirmQuote(b.id)}
                          >
                            <CheckCircle2 size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                            <Text style={styles.confirmQuoteBtnText}>{t.acceptQuote}</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}

                    {/* Job Sheet Completion OTP & Warranty Record */}
                    {b.completionOtp && b.status !== 'COMPLETED' && (
                      <View style={styles.otpCard}>
                        <KeyRound size={16} color="#059669" style={{ marginRight: 8 }} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.otpLabel}>{t.jobSheetOtp}</Text>
                          <Text style={styles.otpCode}>{b.completionOtp}</Text>
                          <Text style={styles.otpHint}>
                            Give this 4-digit code to technician only after repair is completed.
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={styles.simOtpBtn}
                          onPress={() => {
                            setCompletingBookingId(b.id);
                            setEnteredOtp(b.completionOtp || '');
                          }}
                        >
                          <Text style={styles.simOtpBtnText}>Sign Off</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* Sign-off OTP Modal/Input if triggered */}
                    {completingBookingId === b.id && (
                      <View style={styles.otpInputBox}>
                        <Text style={styles.otpInputTitle}>Technician OTP Sign-Off Entry</Text>
                        <View style={styles.otpInputRow}>
                          <TextInput
                            style={styles.otpInput}
                            placeholder="Enter 4-digit OTP"
                            keyboardType="numeric"
                            maxLength={4}
                            value={enteredOtp}
                            onChangeText={setEnteredOtp}
                          />
                          <TouchableOpacity
                            style={styles.verifyOtpBtn}
                            onPress={() => handleCompleteJobWithOtp(b)}
                          >
                            <Text style={styles.verifyOtpBtnText}>Verify & Complete</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}

                    {/* Completed Warranty Passport Badge */}
                    {b.status === 'COMPLETED' && (
                      <View style={styles.warrantyBadge}>
                        <Award size={16} color="#D97706" style={{ marginRight: 6 }} />
                        <Text style={styles.warrantyText}>
                          {t.serviceWarranty} • Code: {b.warrantyPassportCode}
                        </Text>
                      </View>
                    )}
                  </View>
                ))
              )}
            </ScrollView>
          )}

          {/* Enquiry Submission Bottom Sheet */}
          {selectedProvider && (
            <View style={styles.enquiryDrawer}>
              <View style={styles.drawerHeader}>
                <Text style={styles.drawerTitle}>Request Quote: {selectedProvider.name}</Text>
                <TouchableOpacity onPress={() => setSelectedProvider(null)}>
                  <X size={18} color="#64748B" />
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Describe Fault or Required Service</Text>
              <TextInput
                style={styles.drawerInput}
                placeholder="e.g. AC cooling gas leak, water dripping from indoor unit..."
                placeholderTextColor="#94A3B8"
                value={description}
                onChangeText={setDescription}
                multiline
              />

              <Text style={styles.inputLabel}>Preferred Visit Time Slot</Text>
              <View style={styles.slotRow}>
                {['MORNING', 'AFTERNOON', 'EVENING'].map((slot) => (
                  <TouchableOpacity
                    key={slot}
                    style={[styles.slotBtn, preferredSlot === slot && styles.slotBtnActive]}
                    onPress={() => setPreferredSlot(slot)}
                  >
                    <Text style={[styles.slotText, preferredSlot === slot && styles.slotTextActive]}>
                      {slot}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.submitEnqBtn}
                onPress={handleCreateEnquiry}
                disabled={submittingEnquiry}
              >
                {submittingEnquiry ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitEnqBtnText}>Send Enquiry (Free & No Lock)</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    marginRight: 10,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#F8FAFC',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  tabBtnActive: {
    backgroundColor: '#2563EB',
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  loaderWrap: {
    padding: 40,
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 10,
    fontSize: 13,
    color: '#64748B',
  },
  contentScroll: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  categoryPillRow: {
    paddingVertical: 6,
    gap: 8,
  },
  catPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 6,
  },
  catPillActive: {
    backgroundColor: '#0F172A',
  },
  catPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  catPillTextActive: {
    color: '#FFFFFF',
  },
  providersList: {
    marginTop: 14,
    paddingBottom: 24,
  },
  providerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 12,
  },
  providerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  providerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },
  verifiedTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16A34A',
    marginLeft: 2,
  },
  providerTrade: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  trustScoreTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  trustScoreText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
    marginLeft: 4,
  },
  providerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: '#64748B',
  },
  feeHighlight: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  cardActionsRow: {
    marginTop: 12,
  },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 10,
    paddingVertical: 9,
  },
  bookBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 12,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bookingId: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  bookingDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusEnquiry: {
    backgroundColor: '#F1F5F9',
  },
  statusConfirmed: {
    backgroundColor: '#EFF6FF',
  },
  statusCompleted: {
    backgroundColor: '#DCFCE7',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statusTextEnquiry: {
    color: '#475569',
  },
  statusTextConfirmed: {
    color: '#2563EB',
  },
  statusTextCompleted: {
    color: '#16A34A',
  },
  quoteBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quoteTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  quoteMathRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  quoteMathItem: {
    fontSize: 10,
    color: '#64748B',
  },
  quoteTotal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  confirmQuoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 8,
    marginTop: 8,
  },
  confirmQuoteBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  otpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  otpLabel: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '600',
  },
  otpCode: {
    fontSize: 16,
    fontWeight: '800',
    color: '#047857',
    letterSpacing: 1,
  },
  otpHint: {
    fontSize: 9,
    color: '#065F46',
    marginTop: 2,
  },
  simOtpBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  simOtpBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  otpInputBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 10,
    marginTop: 8,
  },
  otpInputTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 6,
  },
  otpInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  otpInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 10,
    height: 36,
    fontSize: 13,
  },
  verifyOtpBtn: {
    backgroundColor: '#D97706',
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  verifyOtpBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  warrantyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 8,
    marginTop: 10,
  },
  warrantyText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  emptyWrap: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#64748B',
  },
  enquiryDrawer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  drawerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  drawerInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 10,
    height: 60,
    textAlignVertical: 'top',
    fontSize: 12,
    color: '#0F172A',
    marginBottom: 12,
  },
  slotRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  slotBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  slotBtnActive: {
    backgroundColor: '#2563EB',
  },
  slotText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  slotTextActive: {
    color: '#FFFFFF',
  },
  submitEnqBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitEnqBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
