import { registerWebModule, NativeModule } from 'expo';

import { AnonAadhaarPackageModuleEvents, Result } from './AnonAadhaarPackage.types';

class AnonAadhaarPackageModule extends NativeModule<AnonAadhaarPackageModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
  generateCircomProof(zkeyPath: string, circuitInputs: string) {
    throw new Error('Not implemented on web');
  }
  verifyProof(zkeyPath: string, proofResult: Result) {
    throw new Error('Not implemented on web');
  }
}

export default registerWebModule(AnonAadhaarPackageModule);
