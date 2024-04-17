/* eslint-disable react-native/no-inline-styles */
import { Text, TouchableOpacity, View } from 'react-native';
import { modalStyles } from './modalStyles';
import { AadhaarScanner } from '../aadhaarScanner';
import { uploadAadhaarPNG } from '../uploadPNG';
import React, { useState } from 'react';
import { SvgXml } from 'react-native-svg';
import { icons } from '../icons';

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
      <View>
        <Text style={modalStyles.headerQr}>
          Create a proof of your Aadhaar ID.
        </Text>
        <Text style={modalStyles.footnote}>
          This process is local in your device for privacy, and QR images are
          not uploaded to any server.
        </Text>
      </View>

      <View style={{ marginTop: 15 }}>
        <TouchableOpacity
          style={modalStyles.scanQrButton}
          onPress={() => setCameraOn(true)}
        >
          <View style={modalStyles.scanQrIcon}>
            <SvgXml xml={icons.qrIcon} width="30" height="30" />
          </View>
          <Text style={modalStyles.scanQrText}>
            Scan QR code from the letter or PDF
          </Text>
        </TouchableOpacity>

        <View>
          <AadhaarScanner
            cameraOn={cameraOn}
            setCameraOn={setCameraOn}
            setQrCodeValue={setQrCodeValue}
            setCurrentScreen={setCurrentScreen}
            setIsVerifyingSig={setIsVerifyingSig}
          />
        </View>
        <TouchableOpacity
          style={[modalStyles.scanQrButton, { flexDirection: 'column' }]}
          onPress={() => uploadAadhaarPNG(setQrCodeValue, setIsVerifyingSig)}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={modalStyles.uploadPNGIcon}>
              <SvgXml xml={icons.pngIcon} width="34" height="31" />
            </View>
            <Text style={modalStyles.scanQrText}>
              Upload QR image from mAadhaar app
            </Text>
          </View>
          <Text
            style={[modalStyles.footnote, { fontSize: 12, lineHeight: 13 }]}
          >
            How to:{'\n'} &nbsp;1. &nbsp;Enter your Aadhaar card number & OTP
            verification.
            {'\n'} &nbsp;2. Save the QR code using the "Share" button.
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
};
