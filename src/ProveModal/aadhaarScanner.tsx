import React, { useEffect } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import {
  useCodeScanner,
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import { icons } from '../icons';
import { SvgXml } from 'react-native-svg';

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
  // const device = useCameraDevice('back');
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
        setQrCodeValue(codes[0]?.value);
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
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: { flex: 1 },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  cutout: {
    height: 350, // The size of the QR code cutout
    width: 350,
    borderColor: '#000', // Border color from your design
  },
  camera: {
    height: '100%', // Take up full height
    width: '100%', // Take up full width
    alignSelf: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cornerOverlay: {
    position: 'absolute',
    width: 30, // Width of the edge overlays
    height: 30, // Height of the edge overlays
  },
  topLeftEdge: {
    borderTopColor: 'orange', // Color of top edge
    borderLeftColor: 'orange', // Color of left edge
    top: 0,
    left: 0,
    width: 50, // Length of the edge lines, adjust as needed
    height: 50, // Length of the edge lines, adjust as needed
  },
  topRightEdge: {
    borderTopColor: 'white', // Color of top edge
    borderRightColor: 'white', // Color of right edge
    top: 0,
    right: 0,
    width: 50, // Length of the edge lines, adjust as needed
    height: 50, // Length of the edge lines, adjust as needed
  },
  bottomLeftEdge: {
    borderBottomColor: 'white', // Color of bottom edge
    borderLeftColor: 'white', // Color of left edge
    bottom: 0,
    left: 0,
    width: 50, // Length of the edge lines, adjust as needed
    height: 50, // Length of the edge lines, adjust as needed
  },
  bottomRightEdge: {
    borderBottomColor: 'green', // Color of bottom edge
    borderRightColor: 'green', // Color of right edge
    bottom: 0,
    right: 0,
    width: 50, // Length of the edge lines, adjust as needed
    height: 50, // Length of the edge lines, adjust as needed
  },
  edgeStyle: {
    position: 'absolute',
    borderColor: 'transparent',
    borderWidth: 10, // Width of the edge lines, adjust as needed
  },
  scannerText: {
    position: 'absolute',
    top: 50, // Adjust as needed
    color: '#FFF', // White text to match your design
    fontWeight: 'bold',
    fontSize: 18,
  },
  closeButton: {
    position: 'absolute',
    top: 70,
    right: 15,
    zIndex: 10, // Ensure it's above other components
  },
});
