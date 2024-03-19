import {
  AadhaarScanner,
  circuitInputsFromQR,
  verifySignature,
} from '@anon-aadhaar/react-native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  Pressable,
  View,
  ActivityIndicator,
} from 'react-native';

export const Screen1 = ({ setCurrentScreen }) => {
  return (
    <>
      <Text style={styles.header}>Instruction</Text>
      <Text style={styles.textStyle}>
        Anon Aadhaar allows you to create a proof of your Aadhaar ID without
        revealing any personal data. Generate a QR code using the mAadhaar app
        (iOS/Android), by entering your Aadhaar number and OTP verification. You
        can then save the QR as an image using the &apos;Share&apos; button for
        import. This process is local to your browser for privacy, and QR images
        are not uploaded to any server. Note: Internet speed may affect
        processing time.
      </Text>
      <Pressable
        style={styles.buttonGreen}
        onPress={() => setCurrentScreen('screen2')}
      >
        <Text style={styles.buttonText}>Start</Text>
      </Pressable>
    </>
  );
};

export const LoaderScreen = () => {
  return (
    <>
      <ActivityIndicator />
      <Text>We are verifying your document...</Text>
    </>
  );
};

export const SignatureVerifiedScreen = () => {
  return (
    <>
      <Text>Your document is verified 🎉</Text>
    </>
  );
};

const Screen2 = ({
  setIsVerifyingSig,
  setCurrentScreen,
  setAnonAadhaarArgs,
}) => {
  const [cameraOn, setCameraOn] = useState<boolean>(false);
  const [qrCodeValue, setQrCodeValue] = useState<string>('');

  useEffect(() => {
    if (qrCodeValue !== '') {
      verifySignature(qrCodeValue)
        .then((isVerified) => {
          if (isVerified) {
            circuitInputsFromQR(qrCodeValue).then((args) => {
              setAnonAadhaarArgs(args);
              setIsVerifyingSig(false);
              setCurrentScreen('sigVerified');
            });
          }
        })
        .catch((e) => {
          setIsVerifyingSig(false);
          console.error(e);
        });
    }
  }, [qrCodeValue, setAnonAadhaarArgs, setCurrentScreen, setIsVerifyingSig]);

  return (
    <>
      <Text style={styles.header}>Read your secure Aadhaar QR code</Text>

      <Pressable style={styles.actionButton}>
        <Text style={styles.buttonText} onPress={() => setCameraOn(true)}>
          Scan QR Code
        </Text>
      </Pressable>
      <AadhaarScanner
        cameraOn={cameraOn}
        setCameraOn={setCameraOn}
        setQrCodeValue={setQrCodeValue}
        setIsVerifyingSig={setIsVerifyingSig}
      />
      <Text>OR</Text>
      <Pressable style={styles.actionButton}>
        <Text style={styles.buttonText}>Upload PNG</Text>
      </Pressable>
      <View>{''}</View>
    </>
  );
};

export const ProofModal = ({ buttonMessage }: { buttonMessage: string }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('screen1');
  const [isVerifyingSig, setIsVerifyingSig] = useState<boolean>(false);
  const [anonAadhaarArgs, setAnonAadhaarArgs] = useState<{
    aadhaarData: string[];
    aadhaarDataLength: string[];
    signature: string[];
    pubKey: string[];
    signalHash: string[];
  } | null>(null);

  useEffect(() => {
    if (anonAadhaarArgs) console.log(anonAadhaarArgs);
  }, [anonAadhaarArgs]);

  useEffect(() => {
    if (isVerifyingSig === true) setCurrentScreen('Loading');
  }, [isVerifyingSig]);

  return (
    <View style={styles.centeredView}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {(() => {
              switch (currentScreen) {
                case 'screen1':
                  return (
                    <Screen1
                      setModalVisible={setModalVisible}
                      modalVisible={modalVisible}
                      setCurrentScreen={setCurrentScreen}
                    />
                  );
                case 'screen2':
                  return (
                    <Screen2
                      isVerifyingSig={isVerifyingSig}
                      setIsVerifyingSig={setIsVerifyingSig}
                      setCurrentScreen={setCurrentScreen}
                      setAnonAadhaarArgs={setAnonAadhaarArgs}
                    />
                  );
                case 'Loading':
                  return <LoaderScreen />;
                case 'sigVerified':
                  return <SignatureVerifiedScreen />;
                default:
                  return null;
              }
            })()}
          </View>
        </View>
      </Modal>
      <Pressable
        style={styles.buttonWhite}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.buttonText}>{buttonMessage}</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    position: 'absolute',
    justifyContent: 'space-between',
    bottom: 0,
    width: '100%',
    height: '70%',
    backgroundColor: '#E1EAE1',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    fontFamily: 'Outfit-Regular',
    textAlign: 'justify',
    fontSize: 18,
    color: '#F2AE7F',
  },
  header: {
    fontSize: 20,
    color: '#E86A33',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  buttonWhite: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    alignSelf: 'center',
    paddingHorizontal: 50,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderRadius: 50,
    marginTop: 20,
  },
  buttonGreen: {
    alignSelf: 'center',
    paddingHorizontal: 50,
    paddingVertical: 15,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#06753b',
    borderRadius: 50,
    marginTop: 20,
  },
  actionButton: {
    alignSelf: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 50,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#06753b',
    borderRadius: 50,
    marginTop: 20,
  },
  buttonText: {
    fontSize: 20,
    fontFamily: 'Outfit-Light',
    color: '#06753b',
    textAlign: 'center',
  },
});
