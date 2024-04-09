import { NativeModules, Platform } from 'react-native';
import RNFS from 'react-native-fs';

const LINKING_ERROR =
  `The package 'react-native-rapidsnark' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

export type AnonAadhaarArgs = {
  qrDataPadded: string[];
  qrDataPaddedLength: string[];
  nonPaddedDataLength: string[];
  delimiterIndices: string[];
  signature: string[];
  pubKey: string[];
  signalHash: string[];
  revealGender: string[];
  revealAgeAbove18: string[];
  revealState: string[];
  revealPinCode: string[];
};

const fileUrls = {
  // zkey: 'https://d1re67zv2jtrxt.cloudfront.net/v2.0.0/circuit_final.zkey',
  'aadhaar-verifier.dat':
    'https://anon-aadhaar.s3.ap-south-1.amazonaws.com/v2.0.0/aadhaar-verifier.dat',
  'vkey.json': 'https://d1re67zv2jtrxt.cloudfront.net/v2.0.0/vkey.json',
};

async function fetchAndStoreFile(url: string, filePath: string) {
  // Fetching the file
  const response = await fetch(url);
  const blob = await response.blob();
  const reader = new FileReader();
  reader.readAsDataURL(blob);

  return new Promise<void>((resolve, reject) => {
    reader.onloadend = async () => {
      try {
        if (typeof reader.result === 'string') {
          // Now safely assumed to be a string, so we can use the split method
          const base64data = reader.result.split(',')[1]; // Remove the data URL scheme prefix
          if (!base64data) throw Error('Reader result is undefined');
          await RNFS.writeFile(filePath, base64data, 'base64');
          resolve();
        } else {
          // Handle the unexpected case where result is not a string
          reject(new Error('FileReader result is not a string.'));
        }
      } catch (error) {
        reject(error);
      }
    };
  });
}

export async function setupProver() {
  const directoryPath =
    Platform.OS === 'android'
      ? RNFS.DocumentDirectoryPath
      : RNFS.LibraryDirectoryPath;

  for (const [key, url] of Object.entries(fileUrls)) {
    const filePath = `${directoryPath}/${key}`;
    const fileExists = await RNFS.exists(filePath);

    if (!fileExists) {
      await fetchAndStoreFile(url, filePath);
    }

    console.log(`${key} loaded at ${filePath}`);
  }
}

const Rapidsnark = NativeModules.Rapidsnark
  ? NativeModules.Rapidsnark
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export const DEFAULT_PROOF_BUFFER_SIZE = 1024;
export const DEFAULT_ERROR_BUFFER_SIZE = 256;

export async function groth16ProveWithZKeyFilePath(
  zkey_path: string,
  datFilePath: string,
  inputs: AnonAadhaarArgs,
  {
    proofBufferSize = DEFAULT_PROOF_BUFFER_SIZE,
    publicBufferSize,
    errorBufferSize = DEFAULT_ERROR_BUFFER_SIZE,
  }: {
    proofBufferSize: number;
    publicBufferSize: number | undefined;
    errorBufferSize: number;
  } = {
    proofBufferSize: DEFAULT_PROOF_BUFFER_SIZE,
    publicBufferSize: undefined,
    errorBufferSize: DEFAULT_ERROR_BUFFER_SIZE,
  }
): Promise<{ proof: string; pub_signals: string }> {
  let public_buffer_size: number;
  if (!publicBufferSize) {
    public_buffer_size = await groth16PublicSizeForZkeyFile(zkey_path);
  } else {
    public_buffer_size = proofBufferSize;
  }

  return Rapidsnark.groth16ProveWithZKeyFilePath(
    zkey_path,
    datFilePath,
    inputs,
    proofBufferSize,
    public_buffer_size,
    errorBufferSize
  );
}

export function groth16Verify(
  proof: string,
  inputs: string,
  verificationKey: string,
  {
    errorBufferSize = DEFAULT_ERROR_BUFFER_SIZE,
  }: {
    errorBufferSize: number;
  } = {
    errorBufferSize: DEFAULT_ERROR_BUFFER_SIZE,
  }
): Promise<boolean> {
  return Rapidsnark.groth16Verify(
    proof,
    inputs,
    verificationKey,
    errorBufferSize
  );
}

export function groth16PublicSizeForZkeyFile(
  zkeyPath: string,
  {
    errorBufferSize = DEFAULT_ERROR_BUFFER_SIZE,
  }: {
    errorBufferSize: number;
  } = {
    errorBufferSize: DEFAULT_ERROR_BUFFER_SIZE,
  }
): Promise<number> {
  return Rapidsnark.groth16PublicSizeForZkeyFile(zkeyPath, errorBufferSize);
}
