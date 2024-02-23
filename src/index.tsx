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

export function setupMopro() {
  MoproCircomBridge.setup()
    .then((result: any) => {
      console.log('Setup successful', result);
    })
    .catch((error: any) => {
      console.error('Setup failed', error);
    });
}
