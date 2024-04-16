import { Text, TouchableOpacity, View } from 'react-native';
import { modalStyles } from './modalStyles';
import { AadhaarScanner } from '../aadhaarScanner';
import { uploadAadhaarPNG } from '../uploadPNG';
import React, { useState } from 'react';

export const UploadQR = ({
  setCurrentScreen,
  setQrCodeValue,
  setIsVerifyingSig,
}: {
  setCurrentScreen: any;
  setQrCodeValue: React.Dispatch<React.SetStateAction<string>>;
  setIsVerifyingSig: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [cameraOn, setCameraOn] = useState<boolean>(false);

  return (
    <>
      <Text style={modalStyles.header}>Read your secure Aadhaar QR code</Text>

      <TouchableOpacity
        style={modalStyles.actionButton}
        onPress={() => setCameraOn(true)}
      >
        <Text style={modalStyles.buttonText}>Scan QR Code</Text>
      </TouchableOpacity>
      <AadhaarScanner
        cameraOn={cameraOn}
        setCameraOn={setCameraOn}
        setQrCodeValue={setQrCodeValue}
        setCurrentScreen={setCurrentScreen}
        setIsVerifyingSig={setIsVerifyingSig}
      />
      <Text>OR</Text>
      <TouchableOpacity
        style={modalStyles.actionButton}
        onPress={() => uploadAadhaarPNG(setQrCodeValue, setIsVerifyingSig)}
      >
        <Text style={modalStyles.buttonText}>Upload PNG</Text>
      </TouchableOpacity>
      <View>{''}</View>
    </>
  );
};
