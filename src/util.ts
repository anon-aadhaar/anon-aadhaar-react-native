import pako from 'pako';

export function str2ab(str: string) {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

/**
 * Fetch the public key certificate from the serverless function endpoint.
 * @param url Endpoint URL to fetch the public key.
 * @returns {Promise<string | null>} The official Aadhaar public key.
 */
export const fetchCertificateFile = async (
  certUrl: string
): Promise<string | null> => {
  try {
    const response = await fetch(
      `https://nodejs-serverless-function-express-eight-iota.vercel.app/api/get-raw-pk?url=${certUrl}`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch public key from server`);
    }

    const { certData } = await response.json();
    return certData;
  } catch (error) {
    console.error('Error fetching public key:', error);
    return null;
  }
};

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

export function uint8ArrayToHex(byteArray: Uint8Array) {
  return Array.from(byteArray)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}
