import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Palette } from '../theme/colors';
import { trustApi, VerifiedReview } from '../services/trust';

interface SubmitReviewModalProps {
  visible: boolean;
  companyId: string;
  defaultInvoiceCode?: string;
  onClose: () => void;
  onSuccess: (newReview: VerifiedReview) => void;
}

export const SubmitReviewModal: React.FC<SubmitReviewModalProps> = ({
  visible,
  companyId,
  defaultInvoiceCode = 'INV-2026-8812',
  onClose,
  onSuccess,
}) => {
  const [rating, setRating] = useState(5);
  const [invoiceCode, setInvoiceCode] = useState(defaultInvoiceCode);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([
    'BIS Hallmarked',
    'Authentic Purity',
  ]);
  const [loading, setLoading] = useState(false);

  const availableTags = [
    'BIS Hallmarked',
    'Authentic Purity',
    'Instant GST Bill',
    'Accurate Weighment',
    'Polite Staff',
    'Fast Fulfillment',
  ];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async () => {
    if (!comment.trim()) {
      Alert.alert('Required Field', 'Please share a brief comment about your purchase experience.');
      return;
    }

    setLoading(true);
    try {
      const res = await trustApi.submitReview({
        companyId,
        invoiceCode: invoiceCode.trim(),
        rating,
        comment: comment.trim(),
        tags: selectedTags,
      });

      Alert.alert('Review Published! ⭐', 'Your verified buyer review has been added to the store profile.');
      setComment('');
      onSuccess(res.review);
      onClose();
    } catch (e: any) {
      Alert.alert('Submission Failed', e.message || 'Error submitting review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Verified Buyer Review ⭐</Text>
              <Text style={styles.headerSubtitle}>
                Rate this merchant based on your purchase history
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Verified Invoice Badge */}
            <View style={styles.invoiceBadge}>
              <Text style={styles.invoiceBadgeText}>
                🛡️ Verified Purchase Invoice: {invoiceCode}
              </Text>
            </View>

            {/* Star Rating Selector */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Your Rating</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setRating(star)}
                    style={styles.starBtn}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.starIcon, rating >= star && styles.starIconActive]}>
                      ★
                    </Text>
                  </TouchableOpacity>
                ))}
                <Text style={styles.ratingNumberText}>{rating}.0 / 5.0</Text>
              </View>
            </View>

            {/* Tags Selector */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Key Highlights</Text>
              <View style={styles.tagsGrid}>
                {availableTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <TouchableOpacity
                      key={tag}
                      style={[styles.tagChip, isSelected && styles.tagChipSelected]}
                      onPress={() => toggleTag(tag)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.tagText, isSelected && styles.tagTextSelected]}>
                        {isSelected ? '✓ ' : '+ '}
                        {tag}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Comment */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Detailed Feedback</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Share your experience regarding purity, billing, or packaging..."
                placeholderTextColor={Palette.textMuted}
                value={comment}
                onChangeText={setComment}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.disabledBtn]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={Palette.surface} />
              ) : (
                <Text style={styles.submitBtnText}>Publish Verified Review</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(18, 18, 20, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: Palette.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Palette.borderSubtle,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Palette.lilacLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    color: Palette.textPrimary,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 20,
  },
  invoiceBadge: {
    backgroundColor: Palette.mintLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 16,
  },
  invoiceBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.mintDark,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.textPrimary,
    marginBottom: 8,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starBtn: {
    marginRight: 6,
  },
  starIcon: {
    fontSize: 32,
    color: Palette.borderStrong,
  },
  starIconActive: {
    color: '#F59E0B',
  },
  ratingNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.textPrimary,
    marginLeft: 10,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: Palette.background,
    borderWidth: 1,
    borderColor: Palette.border,
    marginRight: 8,
    marginBottom: 8,
  },
  tagChipSelected: {
    backgroundColor: Palette.lilacLight,
    borderColor: Palette.lilac,
  },
  tagText: {
    fontSize: 12,
    color: Palette.textSecondary,
    fontWeight: '500',
  },
  tagTextSelected: {
    color: Palette.lilacDark,
    fontWeight: '700',
  },
  input: {
    backgroundColor: Palette.background,
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Palette.textPrimary,
  },
  textArea: {
    height: 72,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: Palette.primary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: Palette.surface,
    fontSize: 15,
    fontWeight: '700',
  },
});
