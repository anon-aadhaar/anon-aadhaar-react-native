import pako from 'pako';
import RNFS from 'react-native-fs';
import base64 from 'react-native-base64';
import { TextDecoder } from 'text-encoding';
import { fileUrls } from './constants';
import fetchBlob from 'react-native-blob-util';

export function str2ab(str: string) {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

export function convertBigIntToByteArray(bigInt: bigint) {
  const byteLength = Math.max(1, Math.ceil(bigInt.toString(2).length / 8));

  const result = new Uint8Array(byteLength);
  let i = 0;
  while (bigInt > 0) {
    result[i] = Number(bigInt % BigInt(256));
    bigInt = bigInt / BigInt(256);
    i += 1;
  }
  return result.reverse();
}

export function decompressByteArray(byteArray: Uint8Array) {
  const decompressedArray = pako.inflate(byteArray);
  return decompressedArray;
}

// Utils from zk-email
export function uint8ArrayToHex(byteArray: Uint8Array) {
  return Array.from(byteArray)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function int64toBytes(num: number): Uint8Array {
  let arr = new ArrayBuffer(8); // an Int32 takes 4 bytes
  let view = new DataView(arr);
  view.setInt32(4, num, false); // byteOffset = 0; litteEndian = false
  return new Uint8Array(arr);
}

// Utils from zk-email
export function mergeUInt8Arrays(a1: Uint8Array, a2: Uint8Array): Uint8Array {
  // sum of individual array lengths
  var mergedArray = new Uint8Array(a1.length + a2.length);
  mergedArray.set(a1);
  mergedArray.set(a2, a1.length);
  return mergedArray;
}

// Utils from zk-email
// Works only on 32 bit sha text lengths
export function int8toBytes(num: number): Uint8Array {
  let arr = new ArrayBuffer(1); // an Int8 takes 4 bytes
  let view = new DataView(arr);
  view.setUint8(0, num); // byteOffset = 0; litteEndian = false
  return new Uint8Array(arr);
}

// Utils from zk-email
export function assert(cond: boolean, errorMessage: string) {
  if (!cond) {
    throw new Error(errorMessage);
  }
}

// Utils from zk-email
export function sha256Pad(
  prehash_prepad_m: Uint8Array,
  maxShaBytes: number
): [Uint8Array, number] {
  let length_bits = prehash_prepad_m.length * 8; // bytes to bits
  let length_in_bytes = int64toBytes(length_bits);
  prehash_prepad_m = mergeUInt8Arrays(prehash_prepad_m, int8toBytes(2 ** 7)); // Add the 1 on the end, length 505
  // while ((prehash_prepad_m.length * 8 + length_in_bytes.length * 8) % 512 !== 0) {
  while (
    (prehash_prepad_m.length * 8 + length_in_bytes.length * 8) % 512 !==
    0
  ) {
    prehash_prepad_m = mergeUInt8Arrays(prehash_prepad_m, int8toBytes(0));
  }
  prehash_prepad_m = mergeUInt8Arrays(prehash_prepad_m, length_in_bytes);
  assert(
    (prehash_prepad_m.length * 8) % 512 === 0,
    'Padding did not complete properly!'
  );
  let messageLen = prehash_prepad_m.length;
  while (prehash_prepad_m.length < maxShaBytes) {
    prehash_prepad_m = mergeUInt8Arrays(prehash_prepad_m, int64toBytes(0));
  }
  assert(
    prehash_prepad_m.length === maxShaBytes,
    `Padding to max length did not complete properly! Your padded message is ${prehash_prepad_m.length} long but max is ${maxShaBytes}!`
  );
  return [prehash_prepad_m, messageLen];
}

export function splitToWords(
  number: bigint,
  wordsize: bigint,
  numberElement: bigint
) {
  let t = number;
  const words: string[] = [];
  for (let i = BigInt(0); i < numberElement; ++i) {
    const baseTwo = BigInt(2);

    words.push(`${t % BigInt(Math.pow(Number(baseTwo), Number(wordsize)))}`);
    t = BigInt(t / BigInt(Math.pow(Number(BigInt(2)), Number(wordsize))));
  }
  if (!(t === BigInt(0))) {
    throw `Number ${number} does not fit in ${(
      wordsize * numberElement
    ).toString()} bits`;
  }
  return words;
}

// Utils from zk-email
export function Uint8ArrayToCharArray(a: Uint8Array): string[] {
  return Array.from(a).map((x) => x.toString());
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

        await downloadFileForChunkedZkey(url + key + `_${i}.gz`, filePath);
      }
    } else {
      const filePath = `${directoryPath}/${key}`;
      const fileExists = await RNFS.exists(filePath);

      if (!fileExists) {
        await downloadFileForChunkedZkey(url, filePath);
      }

      console.log(`${key} loaded at ${filePath}`);
    }
  }
}

const chunkedDirectoryPath = `${RNFS.DocumentDirectoryPath}/chunked`;

async function ensureDirectoryExists(path: string) {
  const directoryExists = await RNFS.exists(path);
  if (!directoryExists) {
    await RNFS.mkdir(path);
  }
}

async function downloadFileForChunkedZkey(url: string, targetPath: string) {
  // Determine the file extension
  const fileExtension = url.split('.').pop();
  const tempPath = targetPath + (fileExtension === 'gz' ? '.gz' : '');

  try {
    // Download the file to a temporary path
    await fetchBlob.config({ path: tempPath }).fetch('GET', url);
    console.log('The file is temporarily saved to ', tempPath);

    // If the file is a .gz file, read it, decompress it, and write the decompressed content
    if (fileExtension === 'gz') {
      // Read the .gz file as base64
      const base64Data = await RNFS.readFile(tempPath, 'base64');
      // Convert base64 to ArrayBuffer using react-native-base64
      const binaryData = base64.decode(base64Data);
      let bytes = new Uint8Array(binaryData.length);
      for (let i = 0; i < binaryData.length; i++) {
        bytes[i] = binaryData.charCodeAt(i);
      }
      // Decompress with pako
      const decompressed = pako.ungzip(bytes);
      // Convert the decompressed data back to a string to write it
      const decoder = new TextDecoder('utf-8');
      const decompressedStr = decoder.decode(decompressed);

      // Write the decompressed data to the target path
      await RNFS.writeFile(targetPath, decompressedStr, 'utf8');
      console.log('File decompressed to ', targetPath);

      // Optionally, remove the original .gz file after decompression
      await RNFS.unlink(tempPath);
      console.log('Original .gz file removed');
    }
  } catch (error) {
    console.error('Error during file download or decompression:', error);
  }
}
