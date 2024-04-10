import { NativeModules, Platform } from 'react-native';
import RNFS from 'react-native-fs';
import fetchBlob from 'react-native-blob-util';
// import base64 from 'react-native-base64';
// import { TextDecoder } from 'text-encoding';
// import pako from 'pako';

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
  'aadhaar-verifier.dat':
    'https://anon-aadhaar.s3.ap-south-1.amazonaws.com/v2.0.0/aadhaar-verifier.dat',
  'vkey.json': 'https://d1re67zv2jtrxt.cloudfront.net/v2.0.0/vkey.json',
  'circuit_final.zkey':
    'https://d1re67zv2jtrxt.cloudfront.net/v2.0.0/circuit_final.zkey',
};

const chunkedDirectoryPath = `${RNFS.DocumentDirectoryPath}/chunked`;

async function ensureDirectoryExists(path: string) {
  const directoryExists = await RNFS.exists(path);
  if (!directoryExists) {
    await RNFS.mkdir(path);
  }
}

// async function downloadFileForChunkedZkey(url: string, targetPath: string) {
//   // Determine the file extension
//   const fileExtension = url.split('.').pop();
//   const tempPath = targetPath + (fileExtension === 'gz' ? '.gz' : '');

//   try {
//     // Download the file to a temporary path
//     await fetchBlob.config({ path: tempPath }).fetch('GET', url);
//     console.log('The file is temporarily saved to ', tempPath);

//     // If the file is a .gz file, read it, decompress it, and write the decompressed content
//     if (fileExtension === 'gz') {
//       // Read the .gz file as base64
//       const base64Data = await RNFS.readFile(tempPath, 'base64');
//       // Convert base64 to ArrayBuffer using react-native-base64
//       const binaryData = base64.decode(base64Data);
//       let bytes = new Uint8Array(binaryData.length);
//       for (let i = 0; i < binaryData.length; i++) {
//         bytes[i] = binaryData.charCodeAt(i);
//       }
//       // Decompress with pako
//       const decompressed = pako.ungzip(bytes);
//       // Convert the decompressed data back to a string to write it
//       const decoder = new TextDecoder('utf-8');
//       const decompressedStr = decoder.decode(decompressed);

//       // Write the decompressed data to the target path
//       await RNFS.writeFile(targetPath, decompressedStr, 'utf8');
//       console.log('File decompressed to ', targetPath);

//       // Optionally, remove the original .gz file after decompression
//       await RNFS.unlink(tempPath);
//       console.log('Original .gz file removed');
//     }
//   } catch (error) {
//     console.error('Error during file download or decompression:', error);
//   }
// }

async function downloadFile(url: string, targetPath: string) {
  try {
    // Download the file to a temporary path
    await fetchBlob.config({ path: targetPath }).fetch('GET', url);
    console.log('The file is saved to ', targetPath);
  } catch (error) {
    console.error('Error during file download or decompression:', error);
  }
}

export async function setupProverWithChunkedZkey() {
  console.log('Starting setup!');
  const directoryPath = RNFS.DocumentDirectoryPath;

  for (const [key, url] of Object.entries(fileUrls)) {
    console.log('Round for key: ', key);
    // If Zkey, loading zkey chunks
    if (key === 'circuit_final') {
      for (let i = 0; i < 10; i++) {
        const filePath = `${chunkedDirectoryPath}/${key}_${i}.zkey`;
        const fileExists = await RNFS.exists(filePath);

        if (fileExists) continue;

        console.log('Fetching => ', url + key + `_${i}.gz`);
        console.log('Stored at => ', filePath);

        await ensureDirectoryExists(chunkedDirectoryPath);

        await downloadFile(url + key + `_${i}.gz`, filePath);
      }
    } else {
      const filePath = `${directoryPath}/${key}`;
      const fileExists = await RNFS.exists(filePath);

      if (!fileExists) {
        await downloadFile(url, filePath);
      }

      console.log(`${key} loaded at ${filePath}`);
    }
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
