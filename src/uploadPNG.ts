import React from 'react';
import {
  launchImageLibrary,
  type ImageLibraryOptions,
} from 'react-native-image-picker';
import RNQRGenerator from 'rn-qr-generator';

export const uploadAadhaarPNG = (
  setQrCodeValue: React.Dispatch<React.SetStateAction<string>>,
  setIsVerifyingSig?: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const options: ImageLibraryOptions = {
    mediaType: 'photo',
    quality: 1,
    includeBase64: true,
  };

  launchImageLibrary(options, (response) => {
    if (response.didCancel) {
      console.log('User cancelled image picker');
    } else if (response.errorCode) {
      console.log('ImagePicker Error: ', response.errorMessage);
    } else {
      const source = response.assets?.at(0);
      if (source === undefined)
        throw Error('[launchImageLibrary]: Error reading the image');
      const { base64 } = source;
      if (base64 === undefined)
        throw Error(
          '[launchImageLibrary]: Error reading the image, no base64 found'
        );
      if (setIsVerifyingSig) setIsVerifyingSig(true);
      decodeQRCodeFromImage(base64).then((qrCodeData) => {
        setQrCodeValue(qrCodeData);
      });
    }
  });
};

const decodeQRCodeFromImage = async (base64: string): Promise<string> => {
  return RNQRGenerator.detect({
    base64,
  })
    .then((detectedQRCodes) => {
      const { values } = detectedQRCodes;
      if (values[0] === undefined)
        throw Error('[decodeQRCodeFromImage]: QR Code value is undefined');
      return values[0];
    })
    .catch((error: any) => {
      console.log(error);
      throw error;
    });
};
