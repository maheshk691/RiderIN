import React from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { windowHeight, windowWidth } from '@/themes/app.constant';
import color from '@/themes/app.colors';

interface SkeletonLoaderProps {
  width?: number | string;
<<<<<<< HEAD
  height?: number;
  borderRadius?: number;
  style?: any;
  testID?: string;
=======
  height?: number | string;
  borderRadius?: number;
  style?: any;
>>>>>>> de753cf41284fb4b94982221c497e4f25fc50062
}

interface SkeletonRowProps {
  lines?: number;
  lineHeight?: number;
  spacing?: number;
  style?: any;
<<<<<<< HEAD
  testID?: string;
=======
>>>>>>> de753cf41284fb4b94982221c497e4f25fc50062
}

/**
 * Skeleton Loader component for showing loading states
 */
const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = windowHeight(20),
  borderRadius = 4,
<<<<<<< HEAD
  testID,
=======
>>>>>>> de753cf41284fb4b94982221c497e4f25fc50062
  style,
}) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1500,
        easing: Easing.ease,
        useNativeDriver: false,
      })
    ).start();

    return () => {
      animatedValue.stopAnimation();
    };
  }, []);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
<<<<<<< HEAD
    outputRange: ['-100%', '100%'],
=======
    outputRange: [-width, width],
>>>>>>> de753cf41284fb4b94982221c497e4f25fc50062
  });

  return (
    <View
<<<<<<< HEAD
      testID={testID}
=======
>>>>>>> de753cf41284fb4b94982221c497e4f25fc50062
      style={[
        styles.container,
        { width, height, borderRadius },
        style,
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          styles.shimmer,
          {
            transform: [{ translateX }],
          },
        ]}
      />
    </View>
  );
};

/**
 * Skeleton Row component for showing multiple lines of loading content
 */
export const SkeletonRow: React.FC<SkeletonRowProps> = ({
  lines = 3,
  lineHeight = windowHeight(20),
  spacing = windowHeight(10),
  style,
<<<<<<< HEAD
  testID,
}) => {
  return (
    <View testID={testID} style={[styles.rowContainer, style]}>
=======
}) => {
  return (
    <View style={[styles.rowContainer, style]}>
>>>>>>> de753cf41284fb4b94982221c497e4f25fc50062
      {Array(lines)
        .fill(0)
        .map((_, index) => (
          <SkeletonLoader
            key={index}
            height={lineHeight}
            style={{ marginBottom: index < lines - 1 ? spacing : 0 }}
<<<<<<< HEAD
            testID={`skeleton-line-${index}`}
=======
>>>>>>> de753cf41284fb4b94982221c497e4f25fc50062
          />
        ))}
    </View>
  );
};

/**
 * Skeleton Card component for showing loading card UI
 */
<<<<<<< HEAD
export const SkeletonCard: React.FC<{ style?: any, testID?: string }> = ({ style, testID }) => {
  return (
    <View testID={testID} style={[styles.card, style]}>
=======
export const SkeletonCard: React.FC<{ style?: any }> = ({ style }) => {
  return (
    <View style={[styles.card, style]}>
>>>>>>> de753cf41284fb4b94982221c497e4f25fc50062
      <View style={styles.cardHeader}>
        <SkeletonLoader width={windowWidth(50)} height={windowHeight(50)} borderRadius={25} />
        <View style={styles.cardHeaderContent}>
          <SkeletonLoader width="70%" height={windowHeight(18)} />
          <SkeletonLoader width="40%" height={windowHeight(14)} style={{ marginTop: windowHeight(8) }} />
        </View>
      </View>
      <SkeletonLoader height={windowHeight(16)} style={{ marginTop: windowHeight(15) }} />
      <SkeletonLoader height={windowHeight(16)} style={{ marginTop: windowHeight(8) }} />
      <View style={styles.cardFooter}>
        <SkeletonLoader width="30%" height={windowHeight(30)} borderRadius={15} />
        <SkeletonLoader width="30%" height={windowHeight(30)} borderRadius={15} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: color.lightGray,
    overflow: 'hidden',
  },
  shimmer: {
    width: '30%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    opacity: 0.5,
  },
  rowContainer: {
    width: '100%',
  },
  card: {
<<<<<<< HEAD
    backgroundColor: color.whiteColor,
=======
    backgroundColor: color.white,
>>>>>>> de753cf41284fb4b94982221c497e4f25fc50062
    borderRadius: 8,
    padding: windowWidth(15),
    marginBottom: windowHeight(15),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: windowHeight(15),
  },
  cardHeaderContent: {
    flex: 1,
    marginLeft: windowWidth(15),
    justifyContent: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: windowHeight(15),
  },
});

<<<<<<< HEAD
export default SkeletonLoader;
=======
export default SkeletonLoader;
>>>>>>> de753cf41284fb4b94982221c497e4f25fc50062
