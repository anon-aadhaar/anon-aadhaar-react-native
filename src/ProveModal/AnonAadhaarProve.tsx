import React, { useState } from 'react';
import { modalStyles } from './modalStyles';
import { Text, TouchableOpacity } from 'react-native';
import type { FieldsToRevealArray } from '../types';
import { ProveModal } from './ProveModal';

export const AnonAadhaarProve = ({
  buttonMessage = 'Create a Proof',
  nullifierSeed,
  fieldsToRevealArray,
  setProofs,
  signal,
  useTestAadhaar = false,
  buttonStyle,
  buttonTextStyle,
}: {
  buttonMessage: string;
  nullifierSeed: number;
  fieldsToRevealArray?: FieldsToRevealArray;
  signal?: string;
  setProofs?: any;
  useTestAadhaar?: boolean;
  buttonStyle?: any;
  buttonTextStyle?: any;
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <ProveModal
        nullifierSeed={nullifierSeed}
        fieldsToRevealArray={fieldsToRevealArray}
        setProofs={setProofs}
        signal={signal}
        useTestAadhaar={useTestAadhaar}
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
      />
      <TouchableOpacity
        style={[modalStyles.buttonRound, buttonStyle]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[modalStyles.buttonText, buttonTextStyle]}>
          {buttonMessage}
        </Text>
      </TouchableOpacity>
    </>
  );
};
