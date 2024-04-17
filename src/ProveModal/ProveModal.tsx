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
import { WelcomeScreen } from './WelcomeScreen';
import { UploadQR } from './UploadQR';
import { ProveScreen } from './ProveScreen';
import { BlurView } from '@react-native-community/blur';

type ModalScreens = 'loading' | 'sigVerified' | 'welcome' | 'uploadQR';

export const LoaderScreen = () => {
  return (
    <>
      <Text />
      <ActivityIndicator />
      <Text style={modalStyles.resultText}>
        We are verifying your document...
      </Text>
      <Text />
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
  const [currentScreen, setCurrentScreen] = useState<ModalScreens>('welcome');
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
    setCurrentScreen('welcome');
  };

  useEffect(() => {
    if (qrCodeValue !== '') {
      verifySignature(qrCodeValue)
        .then((isVerified) => {
          if (isVerified) {
            circuitInputsFromQR(qrCodeValue).then((args) => {
              setAnonAadhaarArgs(args);
              setCurrentScreen('sigVerified');
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
                    case 'welcome':
                      return (
                        <WelcomeScreen setCurrentScreen={setCurrentScreen} />
                      );
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
                    case 'sigVerified':
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
