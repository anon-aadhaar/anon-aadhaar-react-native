import { NativeModules, Platform } from 'react-native';
import RNFS from 'react-native-fs';
import fetchBlob from 'react-native-blob-util';
// import { unzip } from 'react-native-zip-archive';

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
  'circuit_final': 'https://d1re67zv2jtrxt.cloudfront.net/v2.0.0/chunked_zkey/',
};

const chunkedDirectoryPath = `${RNFS.DocumentDirectoryPath}/chunked`;

async function ensureDirectoryExists(path: string) {
  const directoryExists = await RNFS.exists(path);
  if (!directoryExists) {
    await RNFS.mkdir(path);
  }
}

async function downloadFile(url: string, path: string) {
  const fileExtension = url.split('.').pop();
  try {
    const res = await fetchBlob
      .config({
        fileCache: true,
        path: path,
        appendExt: fileExtension,
      })
      .fetch('GET', url);

    // if (fileExtension === 'gz') {
    //   await unzip(res.path(), path);
    //   console.log('File decompressed to ', path);
    // }
    console.log('The file is saved to ', res.path());
  } catch (error) {
    console.error('Download error:', error);
  }
}

export async function setupProver() {
  console.log('Starting setup!');
  const directoryPath = RNFS.DocumentDirectoryPath;

  for (const [key, url] of Object.entries(fileUrls)) {
    console.log('Round for key: ', key);
    // If Zkey, loading zkey chunks
    if (key === 'circuit_final') {
      for (let i = 0; i < 10; i++) {
        const filePath = `${directoryPath}/${key}_${i}.zkey`;
        const fileExists = await RNFS.exists(filePath);

        if (fileExists) continue;

        console.log('Fetching => ', url + key + `_${i}.gz`);
        console.log('Stored ar => ', filePath);

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
  zkeys_paths: string[],
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
    public_buffer_size = await groth16PublicSizeForChunkedZkeyFile(zkeys_paths);
  } else {
    public_buffer_size = proofBufferSize;
  }

  return Rapidsnark.groth16ProveWithZKeyFilePath(
    zkeys_paths,
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
