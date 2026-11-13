import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import {
  Scan,
  X,
  Barcode,
  QrCode,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Search,
} from 'lucide-react-native';
import { useLanguage } from '../context/LanguageContext';

export type ScannerMode = 'barcode' | 'customer' | 'upi';

interface UniversalScannerModalProps {
  visible: boolean;
  onClose: () => void;
  defaultMode?: ScannerMode;
  onScanResult?: (code: string, mode: ScannerMode) => void;
}

export const UniversalScannerModal: React.FC<UniversalScannerModalProps> = ({
  visible,
  onClose,
  defaultMode = 'barcode',
  onScanResult,
}) => {
  const { t } = useLanguage();
  const [mode, setMode] = useState<ScannerMode>(defaultMode);
  const [manualCode, setManualCode] = useState<string>('');
  const [scannedResult, setScannedResult] = useState<{
    code: string;
    mode: ScannerMode;
    label: string;
    details?: string;
  } | null>(null);

  const handleSimulateScan = (code: string, selectedMode: ScannerMode, label: string, details?: string) => {
    setScannedResult({ code, mode: selectedMode, label, details });
    if (onScanResult) {
      onScanResult(code, selectedMode);
    }
  };

  const handleManualSubmit = () => {
    if (!manualCode.trim()) return;
    const code = manualCode.trim();
    let label = 'Custom Scanned Code';
    if (code.startsWith('tredbook:customer:')) {
      handleSimulateScan(code, 'customer', 'Customer Passport', 'Customer ID: ' + code.replace('tredbook:customer:', ''));
    } else if (code.startsWith('upi://')) {
      handleSimulateScan(code, 'upi', 'UPI Payment QR', 'Intent: ' + code);
    } else {
      handleSimulateScan(code, 'barcode', 'Product Barcode', 'SKU/EAN: ' + code);
    }
    setManualCode('');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <View style={styles.titleRow}>
                <Scan size={22} color="#7C3AED" />
                <Text style={styles.title}>{t.scannerTitle}</Text>
              </View>
              <Text style={styles.subtitle}>{t.scannerSubtitle}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Mode Switcher */}
          <View style={styles.modeTabs}>
            <TouchableOpacity
              style={[styles.modeTab, mode === 'barcode' && styles.modeTabActive]}
              onPress={() => {
                setMode('barcode');
                setScannedResult(null);
              }}
            >
              <Barcode size={16} color={mode === 'barcode' ? '#FFFFFF' : '#4B5563'} />
              <Text style={[styles.modeTabText, mode === 'barcode' && styles.modeTabTextActive]}>
                Item Barcode
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modeTab, mode === 'customer' && styles.modeTabActive]}
              onPress={() => {
                setMode('customer');
                setScannedResult(null);
              }}
            >
              <QrCode size={16} color={mode === 'customer' ? '#FFFFFF' : '#4B5563'} />
              <Text style={[styles.modeTabText, mode === 'customer' && styles.modeTabTextActive]}>
                Customer QR
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modeTab, mode === 'upi' && styles.modeTabActive]}
              onPress={() => {
                setMode('upi');
                setScannedResult(null);
              }}
            >
              <CreditCard size={16} color={mode === 'upi' ? '#FFFFFF' : '#4B5563'} />
              <Text style={[styles.modeTabText, mode === 'upi' && styles.modeTabTextActive]}>
                UPI Payment
              </Text>
            </TouchableOpacity>
          </View>

          {/* Simulated Camera Viewfinder */}
          <View style={styles.cameraViewfinder}>
            <View style={styles.viewfinderCornerTL} />
            <View style={styles.viewfinderCornerTR} />
            <View style={styles.viewfinderCornerBL} />
            <View style={styles.viewfinderCornerBR} />

            <View style={styles.laserLine} />

            <View style={styles.viewfinderCenter}>
              {mode === 'barcode' ? (
                <Barcode size={64} color="rgba(255, 255, 255, 0.7)" />
              ) : mode === 'customer' ? (
                <QrCode size={64} color="rgba(255, 255, 255, 0.7)" />
              ) : (
                <CreditCard size={64} color="rgba(255, 255, 255, 0.7)" />
              )}
              <Text style={styles.viewfinderHint}>Align camera viewfinder with {mode.toUpperCase()} target</Text>
            </View>
          </View>

          {/* Scanned Result Banner */}
          {scannedResult ? (
            <View style={styles.resultBanner}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={16} color="#059669" />
                  <Text style={styles.resultLabel}>{scannedResult.label}</Text>
                </View>
                <Text style={styles.resultCode}>{scannedResult.code}</Text>
                {scannedResult.details && (
                  <Text style={styles.resultDetails}>{scannedResult.details}</Text>
                )}
              </View>
              <TouchableOpacity
                style={styles.resultActionBtn}
                onPress={() => {
                  Alert.alert(
                    'Target Processed',
                    `Action confirmed for code "${scannedResult.code}". Target passed to active form.`,
                    [{ text: 'OK', onPress: onClose }],
                  );
                }}
              >
                <Text style={styles.resultActionBtnText}>Use Code</Text>
                <ArrowRight size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ) : (
            /* Simulation Quick-Triggers for Testing */
            <View style={styles.simTriggersCard}>
              <Text style={styles.simHeading}>Simulation & Quick Test Barcodes:</Text>
              <View style={styles.simBtnRow}>
                {mode === 'barcode' && (
                  <>
                    <TouchableOpacity
                      style={styles.simBtn}
                      onPress={() =>
                        handleSimulateScan(
                          '8901234567890',
                          'barcode',
                          'Product EAN-13',
                          '22K Hallmarked Gold Temple Choker (SKU: GLD-CHK-01)',
                        )
                      }
                    >
                      <Text style={styles.simBtnText}>Gold Choker Barcode</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.simBtn}
                      onPress={() =>
                        handleSimulateScan(
                          '8909876543210',
                          'barcode',
                          'Product EAN-13',
                          'Pure Silver Coin 50g (SKU: SLV-COIN-50G)',
                        )
                      }
                    >
                      <Text style={styles.simBtnText}>Silver Coin Barcode</Text>
                    </TouchableOpacity>
                  </>
                )}

                {mode === 'customer' && (
                  <TouchableOpacity
                    style={[styles.simBtn, { backgroundColor: '#EDE9FE', borderColor: '#DDD6FE' }]}
                    onPress={() =>
                      handleSimulateScan(
                        'tredbook:customer:TB-C000001',
                        'customer',
                        'Customer Passport Verified ✓',
                        'Aarav Patel • CRS 750 (Strong Commercial Conduct)',
                      )
                    }
                  >
                    <Text style={[styles.simBtnText, { color: '#6D28D9' }]}>
                      Scan Customer Passport (TB-C000001)
                    </Text>
                  </TouchableOpacity>
                )}

                {mode === 'upi' && (
                  <TouchableOpacity
                    style={[styles.simBtn, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}
                    onPress={() =>
                      handleSimulateScan(
                        'upi://pay?pa=nilesh.gems@icici&pn=Nilesh%20Gems&am=4500.00&cu=INR',
                        'upi',
                        'Instant Store UPI QR',
                        'Nilesh Gems & Jewellery (₹4,500.00)',
                      )
                    }
                  >
                    <Text style={[styles.simBtnText, { color: '#065F46' }]}>
                      Scan Storefront UPI QR (₹4,500)
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Manual Keyboard Input Fallback */}
          <View style={styles.manualInputRow}>
            <TextInput
              style={styles.manualInput}
              placeholder="Or type barcode / passport manually..."
              placeholderTextColor="#9CA3AF"
              value={manualCode}
              onChangeText={setManualCode}
            />
            <TouchableOpacity style={styles.manualSubmitBtn} onPress={handleManualSubmit}>
              <Search size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
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
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    gap: 6,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modeTabActive: {
    backgroundColor: '#7C3AED',
  },
  modeTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  modeTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  cameraViewfinder: {
    height: 190,
    backgroundColor: '#111827',
    borderRadius: 16,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 14,
  },
  viewfinderCenter: {
    alignItems: 'center',
    gap: 10,
  },
  viewfinderHint: {
    color: '#E5E7EB',
    fontSize: 12,
    fontWeight: '500',
  },
  viewfinderCornerTL: {
    position: 'absolute',
    top: 14,
    left: 14,
    width: 24,
    height: 24,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#7C3AED',
  },
  viewfinderCornerTR: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 24,
    height: 24,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: '#7C3AED',
  },
  viewfinderCornerBL: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    width: 24,
    height: 24,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#7C3AED',
  },
  viewfinderCornerBR: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    width: 24,
    height: 24,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: '#7C3AED',
  },
  laserLine: {
    position: 'absolute',
    top: '50%',
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  resultBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    marginBottom: 14,
  },
  resultLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#065F46',
  },
  resultCode: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
    marginTop: 2,
  },
  resultDetails: {
    fontSize: 11,
    color: '#047857',
    marginTop: 2,
  },
  resultActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  resultActionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  simTriggersCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 14,
  },
  simHeading: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 8,
  },
  simBtnRow: {
    gap: 8,
  },
  simBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  simBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  manualInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  manualInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: '#111827',
  },
  manualSubmitBtn: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
