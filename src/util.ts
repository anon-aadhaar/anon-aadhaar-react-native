/* eslint-disable no-bitwise */
import pako from 'pako';
import RNFS from 'react-native-fs';

export function getVerificationKey(): Promise<string> {
  const path = RNFS.DocumentDirectoryPath + '/vkey.json';
  return RNFS.readFile(path, 'utf8');
}

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

export function bigIntChunksToByteArray(
  bigIntChunks: bigint[],
  bytesPerChunk = 31
) {
  const bytes: number[] = [];

  // Remove last chunks that are 0n
  const cleanChunks = bigIntChunks
    .reverse()
    .reduce(
      (acc: bigint[], item) =>
        acc.length || item !== 0n ? [...acc, item] : [],
      []
    )
    .reverse();

  cleanChunks.forEach((bigInt, i) => {
    let byteCount = 0;

    while (bigInt > 0n) {
      bytes.unshift(Number(bigInt & 0xffn));
      bigInt >>= 8n;
      byteCount++;
    }

    // Except for the last chunk, each chunk should be of size bytesPerChunk
    // This will add 0s that were removed during the conversion because they are LSB
    if (i < cleanChunks.length - 1) {
      if (byteCount < bytesPerChunk) {
        for (let j = 0; j < bytesPerChunk - byteCount; j++) {
          bytes.unshift(0);
        }
      }
    }
  });

  return bytes.reverse(); // reverse to convert little endian to big endian
}

// utils function to convert circuit output to string
export function bigIntsToString(bigIntChunks: bigint[]) {
  return bigIntChunksToByteArray(bigIntChunks)
    .map((byte) => String.fromCharCode(byte))
    .join('');
}
