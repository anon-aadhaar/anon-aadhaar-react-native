import {
  Uint8ArrayToCharArray,
  convertBigIntToByteArray,
  decompressByteArray,
  sha256Pad,
  splitToWords,
  uint8ArrayToHex,
} from './util';
import forge from 'node-forge';
import certificateTest from './certificate';
import { hash } from './hash';
import type { FieldsToRevealArray } from './types';

interface GenerateArgsOptions {
  qrData: string;
  // certificateFile: string;
  nullifierSeed: number;
  fieldsToRevealArray?: FieldsToRevealArray;
  signal?: string;
}

export async function circuitInputsFromQR({
  qrData,
  // certificateFile,
  nullifierSeed,
  fieldsToRevealArray,
  signal,
}: GenerateArgsOptions) {
  const bigIntData = BigInt(qrData);

  const byteArray = convertBigIntToByteArray(bigIntData);

  const decompressedByteArray = decompressByteArray(byteArray);

  // Read signature data
  const signatureBytes = decompressedByteArray.slice(
    decompressedByteArray.length - 256,
    decompressedByteArray.length
  );

  const signedData = decompressedByteArray.slice(
    0,
    decompressedByteArray.length - 256
  );

  const [paddedMsg, messageLen] = sha256Pad(signedData, 512 * 3);

  const delimiterIndices: number[] = [];
  for (let i = 0; i < paddedMsg.length; i++) {
    if (paddedMsg[i] === 255) {
      delimiterIndices.push(i);
    }
    if (delimiterIndices.length === 18) {
      break;
    }
  }

  const publicKey = forge.pki.certificateFromPem(certificateTest).publicKey;

  const pubKey = BigInt(
    '0x' + (publicKey as forge.pki.rsa.PublicKey).n.toString(16)
  );

  const signature = BigInt('0x' + uint8ArrayToHex(signatureBytes));

  if (!fieldsToRevealArray) fieldsToRevealArray = [];

  const fieldsToReveal = {
    revealGender: fieldsToRevealArray.includes('revealGender'),
    revealAgeAbove18: fieldsToRevealArray.includes('revealAgeAbove18'),
    revealState: fieldsToRevealArray.includes('revealState'),
    revealPinCode: fieldsToRevealArray.includes('revealPinCode'),
  };

  return {
    qrDataPadded: Uint8ArrayToCharArray(paddedMsg),
    qrDataPaddedLength: [messageLen.toString()],
    nonPaddedDataLength: [signedData.length.toString()],
    delimiterIndices: delimiterIndices.map((x) => x.toString()),
    signature: splitToWords(signature, BigInt(121), BigInt(17)),
    pubKey: splitToWords(pubKey, BigInt(121), BigInt(17)),
    nullifierSeed: [nullifierSeed],
    // Value of hash(1) hardcoded
    signalHash: [signal ? hash(signal) : hash(1)],
    revealGender: [fieldsToReveal.revealGender ? '1' : '0'],
    revealAgeAbove18: [fieldsToReveal.revealAgeAbove18 ? '1' : '0'],
    revealState: [fieldsToReveal.revealState ? '1' : '0'],
    revealPinCode: [fieldsToReveal.revealPinCode ? '1' : '0'],
  };
}
