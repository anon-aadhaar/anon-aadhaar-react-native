/* eslint-disable no-bitwise */
import { ethers } from 'ethers';

/**
 * Pads a hexadecimal string to a specific length.
 * @param hexString The hexadecimal string to pad.
 * @param length The target length of the string.
 * @returns The padded hexadecimal string.
 */
function zeroPadHex(hexString: string, length: number): string {
  const hexLength = length * 2;
  const actualLength = hexString.length - 2; // subtract the '0x' prefix
  if (actualLength >= hexLength) return hexString;
  return '0x' + '0'.repeat(hexLength - actualLength) + hexString.slice(2);
}

/**
 * Hashes a message using keccak256 after padding it to 32 bytes.
 * @param message The message in any form that can be converted to a BigInt.
 * @returns The hashed message as a BigInt, shifted right by 8 bits.
 */
export function hash(message: string | number | bigint): string {
  // Convert message to a BigInt, and then to a hex string
  const messageBigInt = BigInt(message);
  const hexString = '0x' + messageBigInt.toString(16);

  // Pad the hex string to 32 bytes
  const paddedHexString = zeroPadHex(hexString, 32);

  // Calculate keccak256 hash; this assumes you have some way to access keccak256
  const hashBytes = ethers.keccak256(paddedHexString); // Adjust according to your import or access to keccak256

  // Convert hash to BigInt, right shift by 8 bits
  const hashBigInt = (BigInt(hashBytes) >> 8n).toString();

  return hashBigInt;
}
