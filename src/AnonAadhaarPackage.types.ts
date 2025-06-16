import type { StyleProp, ViewStyle } from 'react-native';

export type OnLoadEventPayload = {
  url: string;
};

export type AnonAadhaarPackageModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
};

export type ChangeEventPayload = {
  value: string;
};

export type AnonAadhaarPackageViewProps = {
  url: string;
  onLoad: (event: { nativeEvent: OnLoadEventPayload }) => void;
  style?: StyleProp<ViewStyle>;
};

// Define the G1 type
export type G1 = {
  x: string;
  y: string;
  z: string;
};

// Define the G2 type
export type G2 = {
  x: string[];
  y: string[];
  z: string[];
};

// Define the ProofCalldata type
export type ProofCalldata = {
  a: G1;
  b: G2;
  c: G1;
  inputs: string[];
};

// Define the Result type
export type Result = {
  proof: ProofCalldata;
  inputs: string[];
};
