import { NativeModules, Platform } from 'react-native';

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

const Groth16Prover = NativeModules.Prover
  ? NativeModules.Prover
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export async function groth16FullProve(args: AnonAadhaarArgs) {
  return Groth16Prover.runProveAction(args);
}

export const DEFAULT_PROOF_BUFFER_SIZE = 1024;
export const DEFAULT_ERROR_BUFFER_SIZE = 256;

// export async function groth16Prove(
//   zkey: string,
//   witness: string,
//   {
//     proofBufferSize = DEFAULT_PROOF_BUFFER_SIZE,
//     publicBufferSize,
//     errorBufferSize = DEFAULT_ERROR_BUFFER_SIZE,
//   }: {
//     proofBufferSize: number;
//     publicBufferSize: number | undefined;
//     errorBufferSize: number;
//   } = {
//     proofBufferSize: DEFAULT_PROOF_BUFFER_SIZE,
//     publicBufferSize: undefined,
//     errorBufferSize: DEFAULT_ERROR_BUFFER_SIZE,
//   }
// ): Promise<{ proof: string; pub_signals: string }> {
//   let public_buffer_size;

//   if (!publicBufferSize) {
//     public_buffer_size = await groth16PublicSizeForZkeyBuf(zkey);
//   } else {
//     public_buffer_size = proofBufferSize;
//   }

//   return Rapidsnark.groth16Prove(
//     zkey,
//     witness,
//     proofBufferSize,
//     public_buffer_size,
//     errorBufferSize
//   );
// }

// export async function groth16ProveWithZKeyFilePath(
//   zkey_path: string,
//   witness: string,
//   {
//     proofBufferSize = DEFAULT_PROOF_BUFFER_SIZE,
//     publicBufferSize,
//     errorBufferSize = DEFAULT_ERROR_BUFFER_SIZE,
//   }: {
//     proofBufferSize: number;
//     publicBufferSize: number | undefined;
//     errorBufferSize: number;
//   } = {
//     proofBufferSize: DEFAULT_PROOF_BUFFER_SIZE,
//     publicBufferSize: undefined,
//     errorBufferSize: DEFAULT_ERROR_BUFFER_SIZE,
//   }
// ): Promise<{ proof: string; pub_signals: string }> {
//   let public_buffer_size: number;
//   if (!publicBufferSize) {
//     public_buffer_size = await groth16PublicSizeForZkeyFile(zkey_path);
//   } else {
//     public_buffer_size = proofBufferSize;
//   }

//   return Rapidsnark.groth16ProveWithZKeyFilePath(
//     zkey_path,
//     witness,
//     proofBufferSize,
//     public_buffer_size,
//     errorBufferSize
//   );
// }

// export async function groth16FullProve(
//   zkey_path: string,
//   args: AnonAadhaarArgs,
//   {
//     proofBufferSize = DEFAULT_PROOF_BUFFER_SIZE,
//     publicBufferSize,
//   }: {
//     proofBufferSize: number;
//     publicBufferSize: number | undefined;
//   } = {
//     proofBufferSize: DEFAULT_PROOF_BUFFER_SIZE,
//     publicBufferSize: undefined,
//   }
// ): Promise<{ proof: string; pub_signals: string }> {
//   let public_buffer_size: number;
//   if (!publicBufferSize) {
//     public_buffer_size = await groth16PublicSizeForZkeyFile(zkey_path);
//   } else {
//     public_buffer_size = proofBufferSize;
//   }

//   return Rapidsnark.groth16FullProve(
//     zkey_path,
//     args,
//     proofBufferSize,
//     public_buffer_size
//   );
// }

export function groth16Verify(proof: string, inputs: string): Promise<boolean> {
  const proofString = JSON.stringify(proof);
  const inputsString = JSON.stringify(inputs);

  return Groth16Prover.groth16Verify(proofString, inputsString);
}

// function groth16PublicSizeForZkeyBuf(
//   zkey: string,
//   {
//     errorBufferSize = DEFAULT_ERROR_BUFFER_SIZE,
//   }: {
//     errorBufferSize: number;
//   } = {
//     errorBufferSize: DEFAULT_ERROR_BUFFER_SIZE,
//   }
// ): Promise<number> {
//   return Rapidsnark.groth16PublicSizeForZkeyBuf(zkey, errorBufferSize);
// }

// export function groth16PublicSizeForZkeyFile(
//   zkeyPath: string,
//   {
//     errorBufferSize = DEFAULT_ERROR_BUFFER_SIZE,
//   }: {
//     errorBufferSize: number;
//   } = {
//     errorBufferSize: DEFAULT_ERROR_BUFFER_SIZE,
//   }
// ): Promise<number> {
//   return Rapidsnark.groth16PublicSizeForZkeyFile(zkeyPath, errorBufferSize);
// }
