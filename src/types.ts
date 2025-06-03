import { ProofCalldata } from "./AnonAadhaarPackage.types";

export type FieldsToReveal = {
  revealAgeAbove18: boolean;
  revealGender: boolean;
  revealState: boolean;
  revealPinCode: boolean;
};

export const fieldsLabel: { key: keyof FieldsToReveal; label: string }[] = [
  { key: 'revealAgeAbove18', label: 'Age Above 18' },
  { key: 'revealGender', label: 'Gender' },
  { key: 'revealState', label: 'State' },
  { key: 'revealPinCode', label: 'PIN Code' },
];

export type FieldKey =
  | 'revealAgeAbove18'
  | 'revealGender'
  | 'revealState'
  | 'revealPinCode';

export type FieldsToRevealArray = FieldKey[];

export type NumericString = `${number}` | string;

export type Groth16Proof = ProofCalldata;

export type AnonAadhaarProof = {
  groth16Proof: Groth16Proof; // 3 points on curve if we use groth16
  pubkeyHash: string;
  timestamp: string;
  nullifierSeed: string;
  nullifier: string;
  signalHash: string;
  ageAbove18: string;
  gender: string;
  state: string;
  pincode: string;
  signal: string;
};

export type AnonAadhaarArgs = {
  qrDataPadded: string[];
  qrDataPaddedLength: string[];
  // nonPaddedDataLength: string[];
  delimiterIndices: string[];
  signature: string[];
  pubKey: string[];
  nullifierSeed: string[];
  signalHash: string[];
  revealGender: string[];
  revealAgeAbove18: string[];
  revealState: string[];
  revealPinCode: string[];
};

export interface GenerateArgsOptions {
  qrData: string;
  isTestAadhaar: boolean;
  nullifierSeed: number;
  fieldsToRevealArray?: FieldsToRevealArray;
  signal?: string;
}
