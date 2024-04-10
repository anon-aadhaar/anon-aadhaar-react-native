import { NativeModules, Platform } from 'react-native';
import RNFS from 'react-native-fs';
import fetchBlob from 'react-native-blob-util';
import { fileUrls } from './constants';

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

async function downloadFile(url: string, targetPath: string) {
  try {
    // Download the file to a temporary path
    await fetchBlob.config({ path: targetPath }).fetch('GET', url);
    console.log('The file is saved to ', targetPath);
  } catch (error) {
    console.error('Error during file download or decompression:', error);
  }
}

export async function setupProver() {
  console.log('Starting setup!');
  for (const [key, url] of Object.entries(fileUrls)) {
    console.log('Round for key: ', key);

    const filePath = `${RNFS.DocumentDirectoryPath}/${key}`;
    const fileExists = await RNFS.exists(filePath);

    if (!fileExists) {
      await downloadFile(url, filePath);
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
  zkeyFilePath: string,
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
    public_buffer_size = await groth16PublicSizeForZkeyFile(zkeyFilePath);
  } else {
    public_buffer_size = proofBufferSize;
  }

  return Rapidsnark.groth16ProveWithZKeyFilePath(
    zkeyFilePath,
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

export function groth16PublicSizeForChunkedZkeyFile(
  zkeyChunksPaths: string[],
  {
    errorBufferSize = DEFAULT_ERROR_BUFFER_SIZE,
  }: {
    errorBufferSize: number;
  } = {
    errorBufferSize: DEFAULT_ERROR_BUFFER_SIZE,
  }
): Promise<number> {
  return Rapidsnark.groth16PublicSizeForChunkedZkeyFile(
    zkeyChunksPaths,
    errorBufferSize
  );
}
