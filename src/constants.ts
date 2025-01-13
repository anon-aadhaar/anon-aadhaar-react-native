import RNFS from 'react-native-fs';

export const fileUrls = {
  'aadhaar-verifier.zip':
    'https://raw.githubusercontent.com/0xVikasRushi/witnesscalc/refs/heads/main/aadhaar-verifier.zip',
  'vkey.json':
    'https://anon-aadhaar-artifacts.s3.eu-central-1.amazonaws.com/v2.0.0/vkey.json',
  'circuit_final.zkey':
    'https://anon-aadhaar-artifacts.s3.eu-central-1.amazonaws.com/v2.0.0/circuit_final.zkey',
};

export const ZIP_URL = {
  'compressed-aadhaar-verifier.zip':
    'https://anon-aadhaar-artifacts.s3.eu-central-1.amazonaws.com/v2.0.0/compressed-aadhaar-verifier.zip',
};

export const VKEY_PATH = `${RNFS.DocumentDirectoryPath}/aadhaar-verifier/vkey.json`;
export const DAT_PATH = `${RNFS.DocumentDirectoryPath}/aadhaar-verifier/aadhaar-verifier.dat`;
export const ZKEY_PATH = `${RNFS.DocumentDirectoryPath}/aadhaar-verifier/circuit_final.zkey`;
