import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated } from 'react-native';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: any;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  borderRadius = 8,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.85,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: width as any,
          height: height as any,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

export const StorySkeletonRow: React.FC = () => (
  <View style={styles.storyRow}>
    {[1, 2, 3, 4, 5].map((i) => (
      <View key={i} style={styles.storyItem}>
        <Skeleton width={58} height={58} borderRadius={29} />
        <Skeleton width={44} height={10} borderRadius={5} style={{ marginTop: 6 }} />
      </View>
    ))}
  </View>
);

export const ThreadSkeletonList: React.FC<{ count?: number }> = ({ count = 5 }) => (
  <View style={styles.threadContainer}>
    {Array.from({ length: count }).map((_, i) => (
      <View key={i} style={styles.threadCard}>
        <Skeleton width={48} height={48} borderRadius={24} />
        <View style={styles.threadDetails}>
          <Skeleton width="60%" height={16} borderRadius={6} />
          <Skeleton width="85%" height={12} borderRadius={6} style={{ marginTop: 8 }} />
        </View>
        <Skeleton width={32} height={10} borderRadius={4} />
      </View>
    ))}
  </View>
);

export const CardSkeleton: React.FC = () => (
  <View style={styles.cardBox}>
    <Skeleton width={40} height={40} borderRadius={10} />
    <Skeleton width="70%" height={20} borderRadius={8} style={{ marginTop: 14 }} />
    <Skeleton width="90%" height={14} borderRadius={6} style={{ marginTop: 8 }} />
    <Skeleton width="50%" height={14} borderRadius={6} style={{ marginTop: 6 }} />
    <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
      <Skeleton width={80} height={24} borderRadius={12} />
      <Skeleton width={100} height={24} borderRadius={12} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E2E8F0',
  },
  storyRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 16,
  },
  storyItem: {
    alignItems: 'center',
  },
  threadContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  threadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  threadDetails: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
  },
  cardBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
});
