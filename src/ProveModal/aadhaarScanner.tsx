import React, { useEffect } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import {
  useCodeScanner,
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';

import { icons } from '../icons';

type AadhaarScannerProps = {
  cameraOn: boolean;
  setCameraOn: React.Dispatch<React.SetStateAction<boolean>>;
  setQrCodeValue: React.Dispatch<React.SetStateAction<string>>;
  setIsVerifyingSig?: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentScreen?: React.Dispatch<React.SetStateAction<string>>;
};

export function AadhaarScanner({
  cameraOn,
  setCameraOn,
  setQrCodeValue,
  setIsVerifyingSig,
  setCurrentScreen,
}: AadhaarScannerProps) {
  const { hasPermission, requestPermission } = useCameraPermission();

  useEffect(() => {
    const getPermission = async () => {
      if (!hasPermission) {
        await requestPermission();
      }
    };

    getPermission();
  }, [hasPermission, requestPermission]);

  const device = useCameraDevice('back', {
    physicalDevices: [
      'ultra-wide-angle-camera',
      'wide-angle-camera',
      'telephoto-camera',
    ],
  });

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: (codes) => {
      if (codes[0]?.value) {
        if (setIsVerifyingSig) setIsVerifyingSig(true);
        setQrCodeValue(codes[0].value);
        if (setCurrentScreen) setCurrentScreen('loading');
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
        <View style={styles.cameraContainer}>
          <Camera
            style={styles.camera}
            device={device}
            isActive={cameraOn}
            codeScanner={codeScanner}
          />
        </View>
        <View style={styles.overlay}>
          <TouchableOpacity
            onPress={() => setCameraOn(false)}
            style={styles.closeButton}
          >
            <SvgXml xml={icons.closeCircle} width="48" height="48" />
          </TouchableOpacity>
          <View style={styles.cutout}>
            <View style={[styles.edgeStyle, styles.topLeftEdge]} />
            <View style={[styles.edgeStyle, styles.topRightEdge]} />
            <View style={[styles.edgeStyle, styles.bottomLeftEdge]} />
            <View style={[styles.edgeStyle, styles.bottomRightEdge]} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  bottomLeftEdge: {
    borderBottomColor: 'white',
    borderLeftColor: 'white',
    bottom: 0,
    height: 50,
    left: 0,
    width: 50,
  },
  bottomRightEdge: {
    borderBottomColor: 'green',
    borderRightColor: 'green',
    bottom: 0,
    height: 50,
    right: 0,
    width: 50,
  },
  camera: {
    flex: 1,
    height: '100%',
    width: '100%',
  },
  cameraContainer: {
    backgroundColor: 'black',
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    right: 15,
    top: 70,
    zIndex: 10,
  },
  cutout: {
    borderColor: '#000',
    height: 350,
    width: 350,
  },
  edgeStyle: {
    borderColor: 'transparent',
    borderWidth: 10,
    position: 'absolute',
  },
  modal: {
    flex: 1,
    margin: 0,
  },
  modalView: {
    backgroundColor: 'black',
    flex: 1,
    margin: 0,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
  },
  topLeftEdge: {
    borderLeftColor: 'orange',
    borderTopColor: 'orange',
    height: 50,
    left: 0,
    top: 0,
    width: 50,
  },
  topRightEdge: {
    borderRightColor: 'white',
    borderTopColor: 'white',
    height: 50,
    right: 0,
    top: 0,
    width: 50,
  },
});
