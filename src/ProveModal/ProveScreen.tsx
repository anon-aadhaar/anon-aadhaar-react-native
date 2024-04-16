import React, { useState } from 'react';
import {
  groth16ProveWithZKeyFilePath,
  groth16Verify,
  type AnonAadhaarArgs,
} from '../groth16Prover';
import { getVerificationKey } from '../util';
import RNFS from 'react-native-fs';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { modalStyles } from './modalStyles';

const zkeyFilePath = RNFS.DocumentDirectoryPath + '/circuit_final.zkey';
const DatFilePath = RNFS.DocumentDirectoryPath + '/aadhaar-verifier.dat';

export const ProveScreen = ({
  anonAadhaarArgs,
  setProofVerified,
  setProofs,
}: {
  anonAadhaarArgs: AnonAadhaarArgs;
  setProofVerified: any;
  setProofs: any;
}) => {
  const [isProving, setIsProving] = useState<boolean>(false);

  const genProof = async () => {
    setIsProving(true);
    try {
      const { proof, pub_signals } = await groth16ProveWithZKeyFilePath(
        zkeyFilePath,
        DatFilePath,
        anonAadhaarArgs
      );
      // TODO Get path of the vk
      const res = await groth16Verify(
        proof,
        pub_signals,
        await getVerificationKey()
      );
      setProofs({ proof, pub_signals });
      setProofVerified(res);
      setIsProving(false);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <Text />
      <Text style={modalStyles.resultText}>Your document is verified 🎉</Text>
      <Text />

      {isProving ? (
        <>
          <ActivityIndicator size="large" color="#06753b" />
          <Text style={modalStyles.buttonText}>
            Generating your proof of identity...
          </Text>
        </>
      ) : (
        <TouchableOpacity
          style={modalStyles.buttonGreen}
          onPress={() => genProof()}
        >
          <Text style={modalStyles.buttonText}>Generate your proof</Text>
        </TouchableOpacity>
      )}
      <View>{''}</View>
    </>
  );
};
