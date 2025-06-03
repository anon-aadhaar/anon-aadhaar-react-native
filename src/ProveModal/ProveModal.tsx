/* eslint-disable react-native/no-inline-styles */
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Text,
  View,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from 'react-native';
import { SvgXml } from 'react-native-svg';

import { circuitInputsFromQR } from '../generateInputs';
import { verifySignature } from '../verifySignature';
import { ProveScreen } from './ProveScreen';
import { UploadQR } from './UploadQR';
import { modalStyles } from './modalStyles';
// import { BlurView } from '@react-native-community/blur';
import { icons } from '../icons';
import type { FieldsToRevealArray, AnonAadhaarArgs } from '../types';

type ModalScreens = 'loading' | 'prove' | 'uploadQR' | 'error';

export const LoaderScreen = () => {
  return (
    <>
      <Text style={modalStyles.header}>
        We are verifying the signature of your document...
      </Text>
      <View style={{ height: '100%', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    </>
  );
};

export const ErrorScreen = () => {
  return (
    <>
      <Text style={modalStyles.header}>Your signature is invalid...</Text>
      <View style={{ height: '100%', justifyContent: 'center' }}>
        <SvgXml xml={icons.errorFrame} width="100" height="100" />
      </View>
    </>
  );
};

export const ProveModal = ({
  nullifierSeed,
  fieldsToRevealArray,
  setProofs,
  signal,
  modalVisible,
  setModalVisible,
  useTestAadhaar = false,
}: {
  modalVisible: boolean;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  nullifierSeed: number;
  fieldsToRevealArray?: FieldsToRevealArray;
  signal?: string;
  setProofs?: any;
  useTestAadhaar?: boolean;
}) => {
  const [currentScreen, setCurrentScreen] = useState<ModalScreens>('uploadQR');
  const [qrCodeValue, setQrCodeValue] = useState<string>('');
  const [proofVerified, setProofVerified] = useState<boolean>(false);
  const [isVerifyingSig, setIsVerifyingSig] = useState<boolean>(false);
  const [anonAadhaarArgs, setAnonAadhaarArgs] =
    useState<AnonAadhaarArgs | null>(null);

  const onCloseModal = useCallback(() => {
    setModalVisible(false);
    setCurrentScreen('uploadQR');
    setQrCodeValue('');
    setIsVerifyingSig(false);
  }, [setModalVisible]);

  useEffect(() => {
    if (proofVerified) {
      onCloseModal();
    }
  }, [onCloseModal, proofVerified]);

  useEffect(() => {
    if (isVerifyingSig) setCurrentScreen('loading');
  }, [isVerifyingSig]);

  useEffect(() => {
    if (qrCodeValue !== '') {
      verifySignature(qrCodeValue, useTestAadhaar)
        .then((isVerified) => {
          if (isVerified) {
            circuitInputsFromQR({
              qrData: qrCodeValue,
              nullifierSeed,
              signal,
              fieldsToRevealArray,
              isTestAadhaar: useTestAadhaar,
            }).then((args) => {
              setAnonAadhaarArgs(args);
              setCurrentScreen('prove');
            });
          } else {
            setCurrentScreen('error');
          }
        })
        .catch((e) => {
          setCurrentScreen('error');
          console.error(e);
        });
    }
  }, [
    qrCodeValue,
    setCurrentScreen,
    nullifierSeed,
    signal,
    fieldsToRevealArray,
    useTestAadhaar,
  ]);

  return (
    <View style={modalStyles.centeredView}>
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
          setModalVisible(!modalVisible);
        }}
      >
        {/* TODO: Add blur view */}
        {/* <BlurView
          style={modalStyles.absolute}
          blurType="dark"
          blurAmount={10}
          reducedTransparencyFallbackColor="dark"
        > */}
        <TouchableWithoutFeedback onPress={onCloseModal}>
          <View style={modalStyles.centeredView}>
            <View style={modalStyles.modalView}>
              {(() => {
                switch (currentScreen) {
                  case 'uploadQR':
                    return (
                      <UploadQR
                        setCurrentScreen={setCurrentScreen}
                        setQrCodeValue={setQrCodeValue}
                        setIsVerifyingSig={setIsVerifyingSig}
                      />
                    );
                  case 'loading':
                    return <LoaderScreen />;
                  case 'error':
                    return <ErrorScreen />;
                  case 'prove':
                    return (
                      anonAadhaarArgs && (
                        <ProveScreen
                          setProofVerified={setProofVerified}
                          anonAadhaarArgs={anonAadhaarArgs}
                          setProofs={setProofs}
                          signal={signal}
                          fieldsToRevealArray={fieldsToRevealArray}
                        />
                      )
                    );
                  default:
                    return null;
                }
              })()}
            </View>
          </View>
        </TouchableWithoutFeedback>
        {/* </BlurView> */}
      </Modal>
    </View>
  );
};
