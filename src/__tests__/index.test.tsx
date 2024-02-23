import { NativeModules } from 'react-native';

// Mock the native module
NativeModules.MoproCircom = {
  setup: jest.fn().mockResolvedValue('setup success'),
  generateProof: jest.fn().mockResolvedValue({ proof: 'some proof' }),
  verifyProof: jest.fn().mockResolvedValue(true),
};

describe('MoproCircom', () => {
  it('setup calls the native module successfully', async () => {
    const result = await NativeModules.MoproCircom.setup(
      'path/to/wasm',
      'path/to/r1cs'
    );
    expect(result).toBe('setup success');
    expect(NativeModules.MoproCircom.setup).toHaveBeenCalledWith(
      'path/to/wasm',
      'path/to/r1cs'
    );
  });
});
