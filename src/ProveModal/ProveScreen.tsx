/* eslint-disable react-native/no-inline-styles */
import React, { useContext, useState } from 'react';
import { groth16ProveWithZKeyFilePath, groth16Verify } from '../groth16Prover';
import { getVerificationKey } from '../util';
import RNFS from 'react-native-fs';
import {
  //   ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { modalStyles } from './modalStyles';
import {
  fieldsLabel,
  type FieldsToRevealArray,
  type AnonAadhaarArgs,
} from '../types';
import { SvgXml } from 'react-native-svg';
import { icons } from '../icons';
import { AnonAadhaarContext } from '../hooks/useAnonAadhaar';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';

const zkeyFilePath = RNFS.DocumentDirectoryPath + '/circuit_final.zkey';
const datFilePath = RNFS.DocumentDirectoryPath + '/aadhaar-verifier.dat';

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
  const { setProofState } = useContext(AnonAadhaarContext);

  const genProof = async () => {
    setIsProving(true);
    try {
      const anonAadhaarProof = await groth16ProveWithZKeyFilePath({
        zkeyFilePath,
        datFilePath,
        inputs: anonAadhaarArgs,
        signal,
      });
      // TODO Get path of the vk
      const isVerified = await groth16Verify(
        anonAadhaarProof,
        await getVerificationKey()
      );
      setProofState('created');
      console.log('Proof is verified: ', isVerified);
      if (setProofs) setProofs(anonAadhaarProof);
      setProofVerified(isVerified);
      setIsProving(false);
    } catch (e) {
      console.error(e);
      setIsProving(false);
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
            {/* <ActivityIndicator size="large" /> */}
            <CountdownCircleTimer
              isPlaying
              duration={10}
              colors={['#06753B', '#06753B']}
              colorsTime={[7, 5]}
            >
              {({ remainingTime }) => (
                <Text
                  style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}
                >
                  {remainingTime}
                </Text>
              )}
            </CountdownCircleTimer>
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
