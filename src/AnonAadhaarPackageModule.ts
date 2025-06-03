import { NativeModule, requireNativeModule } from 'expo';

import {
  AnonAadhaarPackageModuleEvents,
  Result,
} from './AnonAadhaarPackage.types';

declare class AnonAadhaarPackageModule extends NativeModule<AnonAadhaarPackageModuleEvents> {
  PI: number;
  hello(): string;
  generateCircomProof(zkeyPath: string, circuitInputs: string): Promise<Result>;
  verifyProof(zkeyPath: string, proofResult: Result): Promise<boolean>;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<AnonAadhaarPackageModule>(
  'AnonAadhaarPackage'
);
