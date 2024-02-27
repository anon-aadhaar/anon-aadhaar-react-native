import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package '@anon-aadhaar/react-native' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const MoproCircomBridge = NativeModules.MoproCircomBridge
  ? NativeModules.MoproCircomBridge
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export async function setupMopro() {
  try {
    const result = await MoproCircomBridge.setup();
    console.log('Setup successful', result);
  } catch (e) {
    console.error('Setup failed', e);
  }
}

export async function generateProof(circuitInputs: any): Promise<{
  proof: string;
  inputs: string;
}> {
  try {
    const result = await MoproCircomBridge.generateProof(circuitInputs);
    const proof = result.proof;
    const inputs = result.inputs;

    console.log('Proof:', proof);
    console.log('Inputs:', inputs);

    return { proof, inputs };
  } catch (error) {
    console.error(error);
    throw new Error('generateProof: something went wrong!');
  }
}

export async function verifyProof(
  proof: string,
  publicInputs: string
): Promise<boolean> {
  try {
    const isVerified = await MoproCircomBridge.verifyProof(proof, publicInputs);

    return isVerified;
  } catch (error) {
    console.error(error);
    throw new Error('verifyProof: something went wrong!');
  }
}
