import { NativeModules, Platform } from 'react-native';
import RNFS from 'react-native-fs';
import fetchBlob from 'react-native-blob-util';
import { fileUrls } from './constants';
import type { AnonAadhaarArgs, AnonAadhaarProof } from './types';
import storage from './storage';

const LINKING_ERROR =
  `The package 'react-native-rapidsnark' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

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
  {
    zkeyFilePath,
    datFilePath,
    inputs,
    signal,
  }: {
    zkeyFilePath: string;
    datFilePath: string;
    inputs: AnonAadhaarArgs;
    signal?: string;
  },
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
): Promise<AnonAadhaarProof> {
  let public_buffer_size: number;
  if (!publicBufferSize) {
    public_buffer_size = await groth16PublicSizeForZkeyFile(zkeyFilePath);
  } else {
    public_buffer_size = proofBufferSize;
  }

  try {
    const { proof, pub_signals } =
      await Rapidsnark.groth16ProveWithZKeyFilePath(
        zkeyFilePath,
        datFilePath,
        inputs,
        proofBufferSize,
        public_buffer_size,
        errorBufferSize
      );

    const public_signals_array = JSON.parse(pub_signals);

    const fullProof = {
      groth16Proof: proof,
      pubkeyHash: public_signals_array[0],
      timestamp: public_signals_array[2],
      nullifierSeed: inputs.nullifierSeed[0]!,
      nullifier: public_signals_array[1],
      signalHash: inputs.signalHash[0]!,
      ageAbove18: public_signals_array[3],
      gender: public_signals_array[4],
      state: public_signals_array[5],
      pincode: public_signals_array[6],
      signal: signal ? signal : '1',
    };

    await saveProof(fullProof);

    return fullProof;
  } catch (e) {
    console.error(e);
    throw Error(
      '[groth16ProveWithZKeyFilePath]: Error while generating the proof'
    );
  }
}

export function groth16Verify(
  proof: AnonAadhaarProof,
  verificationKey: string,
  {
    errorBufferSize = DEFAULT_ERROR_BUFFER_SIZE,
  }: {
    errorBufferSize: number;
  } = {
    errorBufferSize: DEFAULT_ERROR_BUFFER_SIZE,
  }
): Promise<boolean> {
  console.log('Proof received: ', proof.groth16Proof);
  console.log('Public Inputs received: ', [
    proof.pubkeyHash,
    proof.nullifier,
    proof.timestamp,
    proof.ageAbove18,
    proof.gender,
    proof.state,
    proof.pincode,
    proof.nullifierSeed,
    proof.signalHash,
  ]);

  const public_signals = JSON.stringify([
    proof.pubkeyHash,
    proof.nullifier,
    proof.timestamp,
    proof.ageAbove18,
    proof.gender,
    proof.state,
    proof.pincode,
    proof.nullifierSeed,
    proof.signalHash,
  ]);

  try {
    return Rapidsnark.groth16Verify(
      proof.groth16Proof,
      public_signals,
      verificationKey,
      errorBufferSize
    );
  } catch (e) {
    console.log(e);
    throw Error('[groth16Verify]: Error while verifying the proof');
  }
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

async function saveProof(anonAadhaarProof: AnonAadhaarProof) {
  await storage.save({
    key: 'anonAadhaar', // Note: Do not use underscore("_") in key!
    data: {
      anonAadhaarProof,
    },

    // if expires not specified, the defaultExpires will be applied instead.
    // if set to null, then it will never expire.
    expires: null,
  });
}
