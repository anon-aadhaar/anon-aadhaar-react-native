import {
  convertBigIntToByteArray,
  decompressByteArray,
  uint8ArrayToHex,
} from './util';
import forge from 'node-forge';
import { KEYUTIL, KJUR } from 'jsrsasign';
import { certificateProd, certificateTest } from './certificates';

/**
 * `verifySignature` verifies the digital signature of the provided data.
 * It first converts the string data to a big integer, processes it into a byte array,
 * and then decompresses this byte array. After extracting the signature and signed data,
 * it fetches the public key from a certificate URL, and uses this public key to verify
 * the signature against the signed data.
 *
 * @param {string} qrData - The string representation of the data to be verified.
 * @returns {Promise<boolean>} A promise that resolves to a boolean indicating if the signature is valid.
 *
 * @remarks
 * The function fetches a public key certificate from UIDAI's server (for India's Aadhaar system),
 * either from the production or testing environment based on the `testing` flag.
 * It then uses this public key to verify the signature.
 */
export const verifySignature = async (
  qrData: string,
  useTestAadhaar: boolean
): Promise<boolean> => {
  const bigIntData = BigInt(qrData);

  const byteArray = convertBigIntToByteArray(bigIntData);

  const decompressedByteArray = decompressByteArray(byteArray);

  // Read signature data
  const signature = decompressedByteArray.slice(
    decompressedByteArray.length - 256,
    decompressedByteArray.length
  );

  const signedData = decompressedByteArray.slice(
    0,
    decompressedByteArray.length - 256
  );

  const publicKey = forge.pki.certificateFromPem(
    useTestAadhaar ? certificateTest : certificateProd
  ).publicKey;
  const publicKeyPem = forge.pki.publicKeyToPem(publicKey);

  // Get the public key object from PEM formatted string
  const pk = KEYUTIL.getKey(publicKeyPem);

  // Create a new Signature object specifying the SHA256withRSA algorithm
  const sig = new KJUR.crypto.Signature({ alg: 'SHA256withRSA' });

  // Initialize the Signature object with the public key
  sig.init(pk);

  // Update the Signature object with the data to be verified
  sig.updateHex(uint8ArrayToHex(signedData));

  return sig.verify(uint8ArrayToHex(signature));
};
