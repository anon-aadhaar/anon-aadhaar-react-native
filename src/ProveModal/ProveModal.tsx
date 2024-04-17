/* eslint-disable react-native/no-inline-styles */
import { verifySignature } from '../verifySignature';
import { circuitInputsFromQR } from '../generateInputs';
import React, { useEffect, useState } from 'react';
import { modalStyles } from './modalStyles';
import {
  Alert,
  Modal,
  Text,
  Pressable,
  View,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from 'react-native';
import { type AnonAadhaarArgs } from '../groth16Prover';
import { UploadQR } from './UploadQR';
import { ProveScreen } from './ProveScreen';
import { BlurView } from '@react-native-community/blur';

type ModalScreens = 'loading' | 'prove' | 'uploadQR';

export const LoaderScreen = () => {
  return (
    <>
      <Text style={modalStyles.header}>
        We are verifying the signature of your document...
      </Text>
      <View style={{ height: '100%', justifyContent: 'center' }}>
        <ActivityIndicator size={'large'} />
      </View>
    </>
  );
};

export const ProveModal = ({
  buttonMessage,
  setProofs,
}: {
  buttonMessage: string;
  setProofs: any;
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<ModalScreens>('uploadQR');
  const [qrCodeValue, setQrCodeValue] = useState<string>('');
  const [proofVerified, setProofVerified] = useState<boolean>(false);
  const [isVerifyingSig, setIsVerifyingSig] = useState<boolean>(false);
  const [anonAadhaarArgs, setAnonAadhaarArgs] =
    useState<AnonAadhaarArgs | null>(null);

  useEffect(() => {
    if (proofVerified) onCloseModal();
  }, [proofVerified]);

  useEffect(() => {
    if (isVerifyingSig) setCurrentScreen('loading');
  }, [isVerifyingSig]);
  setIsVerifyingSig;

  const onCloseModal = () => {
    setModalVisible(false);
    setCurrentScreen('uploadQR');
  };

  useEffect(() => {
    if (qrCodeValue !== '') {
      verifySignature(qrCodeValue)
        .then((isVerified) => {
          if (isVerified) {
            circuitInputsFromQR({
              qrData: qrCodeValue,
              nullifierSeed: 1234,
            }).then((args) => {
              setAnonAadhaarArgs(args);
              setCurrentScreen('prove');
            });
          }
        })
        .catch((e) => {
          console.error(e);
        });
    }
  }, [qrCodeValue, setCurrentScreen]);

  return (
    <View style={modalStyles.centeredView}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
          setModalVisible(!modalVisible);
        }}
      >
        <BlurView
          style={modalStyles.absolute}
          blurType="dark"
          blurAmount={10}
          reducedTransparencyFallbackColor="dark"
        >
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
                    case 'prove':
                      return (
                        anonAadhaarArgs && (
                          <ProveScreen
                            setProofVerified={setProofVerified}
                            anonAadhaarArgs={anonAadhaarArgs}
                            setProofs={setProofs}
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
        </BlurView>
      </Modal>
      <Pressable
        style={modalStyles.buttonWhite}
        onPress={() => setModalVisible(true)}
      >
        <Text style={modalStyles.buttonText}>{buttonMessage}</Text>
      </Pressable>
    </View>
  );
};
