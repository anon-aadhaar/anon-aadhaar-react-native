import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import {
  useCodeScanner,
  Camera,
  useCameraDevice,
} from 'react-native-vision-camera';

type AadhaarScannerProps = {
  cameraOn: boolean;
  setCameraOn: React.Dispatch<React.SetStateAction<boolean>>;
  setQrCodeValue: React.Dispatch<React.SetStateAction<string>>;
};

export function AadhaarScanner({
  cameraOn,
  setCameraOn,
  setQrCodeValue,
}: AadhaarScannerProps) {
  const device = useCameraDevice('back');

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: (codes) => {
      if (codes[0]?.value) {
        setQrCodeValue(codes[0]?.value);
        setCameraOn(false);
      }
    },
  });

  if (device == null) return null;

  return (
    <Modal
      animationType="slide"
      transparent={false}
      style={styles.modal}
      visible={cameraOn}
      onRequestClose={() => {
        setCameraOn(false);
      }}
    >
      <View style={styles.modalView}>
        <Camera
          style={styles.camera}
          device={device}
          isActive={cameraOn}
          codeScanner={codeScanner}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: { flex: 1 },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  camera: {
    flex: 1,
    width: '100%',
  },
});
