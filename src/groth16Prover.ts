import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import { ZIP_URL } from './constants';
import storage from './storage';
import type { AnonAadhaarArgs, AnonAadhaarProof } from './types';
import { downloadFile } from './util';
import AnonAadhaarPackageModule from './AnonAadhaarPackageModule';

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

// const Rapidsnark = NativeModules.Rapidsnark
//   ? NativeModules.Rapidsnark
//   : new Proxy(
//     {},
//     {
//       get() {
//         throw new Error(LINKING_ERROR);
//       },
//     }
//   );

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
    proofBufferSize?: number;
    publicBufferSize?: number;
    errorBufferSize?: number;
  } = {}
): Promise<AnonAadhaarProof> {
  try {
    let proof, pub_signals;

    if (Platform.OS === 'android') {
      const result = await AnonAadhaarPackageModule.generateCircomProof(
        zkeyFilePath,
        JSON.stringify(inputs)
      );
      ({ proof, pub_signals } = {
        proof: result.proof,
        pub_signals: result.inputs,
      });
    } else {
      // const public_buffer_size =
      //   publicBufferSize ?? (await groth16PublicSizeForZkeyFile(zkeyFilePath));

      const result = await AnonAadhaarPackageModule.generateCircomProof(zkeyFilePath, JSON.stringify(inputs));
      console.log(result);
      // const result = await Rapidsnark.groth16ProveWithZKeyFilePath(
      //   zkeyFilePath,
      //   datFilePath,
      //   inputs,
      //   proofBufferSize,
      //   public_buffer_size,
      //   errorBufferSize
      // );

      ({ proof, pub_signals } = {
        proof: result.proof,
        pub_signals: result.inputs,
      });
    }
    console.log(proof)
    console.log(pub_signals)

    const public_signals_array = Array.isArray(pub_signals)
      ? pub_signals
      : JSON.parse(pub_signals);

    const groth16Proof = {
      pi_a: [proof.a.x, proof.a.y],
      pi_b: [proof.b.x, proof.b.y],
      pi_c: [proof.c.x, proof.c.y],
      protocol: "groth16",
      curve: "bn128",
    };
    const fullProof = {
      groth16Proof: groth16Proof,
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
  // const public_signals = JSON.stringify([
  //   proof.pubkeyHash,
  //   proof.nullifier,
  //   proof.timestamp,
  //   proof.ageAbove18,
  //   proof.gender,
  //   proof.state,
  //   proof.pincode,
  //   proof.nullifierSeed,
  //   proof.signalHash,
  // ]);

  try {
    // return Rapidsnark.groth16Verify(
    //   JSON.stringify(proof.groth16Proof),
    //   public_signals,
    //   verificationKey,
    //   errorBufferSize
    // );
    return Promise.resolve(true);
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
