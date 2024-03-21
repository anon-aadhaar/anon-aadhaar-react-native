import React, { type FunctionComponent } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

type CircularProgressProps = {
  size: number;
  strokeWidth: number;
  progress: number;
};

export const CircularProgress: FunctionComponent<CircularProgressProps> = ({
  size,
  strokeWidth,
  progress,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  return (
    <Svg height={size} width={size} style={styles.svg}>
      <Circle
        stroke="#F7D0B1"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
        fill="none"
      />
      <Circle
        stroke="#E86A33"
        fill="none"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={(1 - progress) * circumference}
        strokeLinecap="round"
        transform={`rotate(-90, ${size / 2}, ${size / 2})`}
      />
    </Svg>
  );
};

const styles = StyleSheet.create({
  svg: {
    position: 'absolute',
  },
});
