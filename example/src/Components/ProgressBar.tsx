import React from 'react';
import { StyleSheet, View } from 'react-native';

export const ProgressBar = ({
  currentIndex,
  itemCount,
}: {
  currentIndex: number;
  itemCount: number;
}) => {
  return (
    <View style={styles.progressBarContainer}>
      {Array.from({ length: itemCount }, (_, index) => (
        <View
          key={index}
          style={[styles.dot, currentIndex === index && styles.activeDot]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  activeDot: {
    backgroundColor: '#06753b', // Active dot color
    width: 20, // Larger width for active bar
    height: 8, // Same height for bar
    borderRadius: 4, // This will keep the edges rounded
    // For a more "bar" like appearance, you can set borderRadius to 0
  },
  dot: {
    backgroundColor: 'gray', // Inactive dot color
    width: 8, // Small width for dots
    height: 8, // Small height for dots
    borderRadius: 4, // Half of width/height to make it circular
    marginHorizontal: 4, // Spacing between dots
    // transition: 'all 0.2s ease-in-out', // Smooth transition for web, ignored in native
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 20, // Adjust height as needed
    marginVertical: 10, // Spacing above and below the progress bar
  },
});
