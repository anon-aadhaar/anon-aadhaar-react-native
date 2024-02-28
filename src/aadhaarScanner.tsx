import React, { type Dispatch, type SetStateAction } from 'react';
import { StyleSheet } from 'react-native';
import {
  useCodeScanner,
  Camera,
  useCameraDevice,
} from 'react-native-vision-camera';

type AadhaarScannerProps = {
  cameraOn: boolean;
  setCameraOn: Dispatch<SetStateAction<boolean>>;
  setQrCodeValue: Dispatch<SetStateAction<string>>;
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

  console.log(device);

  if (device == null) return null;
  return cameraOn ? (
    <Camera
      style={styles.camera}
      device={device}
      isActive={cameraOn}
      codeScanner={codeScanner}
    />
  ) : null;
}

const styles = StyleSheet.create({
  camera: {
    height: 460,
    width: '92%',
    alignSelf: 'center',
  },
});
