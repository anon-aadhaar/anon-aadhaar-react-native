import RNFS from 'react-native-fs';

import AnonAadhaarPackageModule from './AnonAadhaarPackageModule';
import { ZIP_URL } from './constants';
import storage from './storage';
import type { AnonAadhaarArgs, AnonAadhaarProof } from './types';
import { downloadFile } from './util';

export async function setupProver() {
  try {
    const zipUrl = ZIP_URL['compressed-aadhaar-verifier.zip'];
    const zipFilePath = `${RNFS.DocumentDirectoryPath}/compressed-aadhaar-verifier.zip`;
    const aadhaarVerifier = `${RNFS.DocumentDirectoryPath}/aadhaar-verifier`;

    const folderExists = await RNFS.exists(aadhaarVerifier);
    if (folderExists) {
      console.log('Setup already complete');
      return;
    }

    // possible corruption case
    const zipExists = await RNFS.exists(zipFilePath);
    if (zipExists) {
      console.log('Found incomplete setup, removing zip file');
      await RNFS.unlink(zipFilePath);
    }

    console.log('Downloading verifier...');
    await downloadFile(zipUrl, zipFilePath);
    console.log('Setup complete');
  } catch (error) {
    console.log('Setup failed:', error);
  }
}

export const DEFAULT_PROOF_BUFFER_SIZE = 1024;
export const DEFAULT_ERROR_BUFFER_SIZE = 256;

export async function groth16ProveWithZKeyFilePath({
  zkeyFilePath,
  inputs,
  signal,
}: {
  zkeyFilePath: string;
  inputs: AnonAadhaarArgs;
  signal?: string;
}): Promise<AnonAadhaarProof> {
  try {
    const result = await AnonAadhaarPackageModule.generateCircomProof(
      zkeyFilePath,
      JSON.stringify(inputs)
    );

    const { proof, pub_signals } = {
      proof: result.proof,
      pub_signals: result.inputs,
    };

    const public_signals_array = Array.isArray(pub_signals)
      ? pub_signals
      : JSON.parse(pub_signals);

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
  } catch (error) {
    console.error('[groth16ProveWithZKeyFilePath]:', error);
    throw new Error(
      '[groth16ProveWithZKeyFilePath]: Error while generating the proof'
    );
  }
}
export async function groth16Verify(
  zkeyFilePath: string,
  proof: AnonAadhaarProof
): Promise<boolean> {
  const public_signals = [
    proof.pubkeyHash,
    proof.nullifier,
    proof.timestamp,
    proof.ageAbove18,
    proof.gender,
    proof.state,
    proof.pincode,
    proof.nullifierSeed,
    proof.signalHash,
  ];
  const proofResult = {
    proof: proof.groth16Proof,
    inputs: public_signals,
  };

  try {
    const valid = await AnonAadhaarPackageModule.verifyProof(
      zkeyFilePath,
      proofResult
    );

    return valid;
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
  // return Rapidsnark.groth16PublicSizeForZkeyFile(zkeyPath, errorBufferSize);
  return Promise.resolve(0);
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
  // return Rapidsnark.groth16PublicSizeForChunkedZkeyFile(
  //   zkeyChunksPaths,
  //   errorBufferSize
  // );
  return Promise.resolve(0);
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
