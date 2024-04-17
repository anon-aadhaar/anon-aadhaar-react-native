/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import {
  groth16ProveWithZKeyFilePath,
  groth16Verify,
  type AnonAadhaarArgs,
} from '../groth16Prover';
import { getVerificationKey } from '../util';
import RNFS from 'react-native-fs';
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { modalStyles } from './modalStyles';
import { fieldsLabel, type FieldsToRevealArray } from '../types';
import { SvgXml } from 'react-native-svg';
import { icons } from '../icons';

const zkeyFilePath = RNFS.DocumentDirectoryPath + '/circuit_final.zkey';
const DatFilePath = RNFS.DocumentDirectoryPath + '/aadhaar-verifier.dat';

export const ProveScreen = ({
  anonAadhaarArgs,
  setProofVerified,
  setProofs,
  signal,
  fieldsToRevealArray,
}: {
  anonAadhaarArgs: AnonAadhaarArgs;
  setProofVerified: any;
  setProofs?: any;
  signal: string | undefined;
  fieldsToRevealArray: FieldsToRevealArray | undefined;
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
      if (setProofs) setProofs({ proof, pub_signals });
      setProofVerified(res);
      setIsProving(false);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      {isProving ? (
        <>
          <Text style={modalStyles.header}>
            Generating your proof of identity...
          </Text>
          <View style={{ height: '100%', justifyContent: 'center' }}>
            <ActivityIndicator size="large" />
          </View>
        </>
      ) : (
        <>
          <Text style={modalStyles.headerQr}>Your document is verified.</Text>

          <View
            style={{
              height: '100%',
              justifyContent: 'flex-start',
            }}
          >
            {fieldsToRevealArray && (
              <>
                <Text
                  style={[
                    modalStyles.subhead,
                    { textAlign: 'left', marginTop: 10, marginBottom: 10 },
                  ]}
                >
                  Data you are sharing:
                </Text>
                <FlatList
                  style={modalStyles.flatList}
                  data={fieldsLabel}
                  renderItem={({ item }) => (
                    <View style={modalStyles.fieldToRevealContainer}>
                      <View style={modalStyles.fieldToReveal}>
                        <View
                          style={{ width: 22, height: 22, marginRight: 16 }}
                        >
                          <SvgXml
                            xml={
                              fieldsToRevealArray.includes(item.key)
                                ? icons.eyeLine
                                : icons.eyeOffLine
                            }
                            width="30"
                            height="30"
                          />
                        </View>
                        <Text style={modalStyles.fieldToRevealText}>
                          {item.label}
                        </Text>
                      </View>
                    </View>
                  )}
                  keyExtractor={(item) => item.key}
                />
              </>
            )}
            {signal && (
              <>
                <Text
                  style={[
                    modalStyles.subhead,
                    { textAlign: 'left', marginTop: 10, marginBottom: 10 },
                  ]}
                >
                  Data you are signing:
                </Text>
                <View style={modalStyles.fieldToReveal}>
                  <Text style={modalStyles.callout}>{signal}</Text>
                </View>
              </>
            )}
            <View style={{ width: '100%' }}>
              <TouchableOpacity
                style={modalStyles.proveButton}
                onPress={() => genProof()}
              >
                <Text style={modalStyles.buttonText}>Generate your proof</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </>
  );
};
