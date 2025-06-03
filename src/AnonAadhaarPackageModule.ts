import { NativeModule, requireNativeModule } from 'expo';

import {
  AnonAadhaarPackageModuleEvents,
  Result,
  CircomProofResult,
} from './AnonAadhaarPackage.types';

declare class AnonAadhaarPackageModule extends NativeModule<AnonAadhaarPackageModuleEvents> {
  PI: number;
  hello(): string;
  generateCircomProof(zkeyPath: string, circuitInputs: string): Result;
  verifyProof(zkeyPath: string, proofResult: CircomProofResult): Promise<boolean>;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<AnonAadhaarPackageModule>('AnonAadhaarPackage');
