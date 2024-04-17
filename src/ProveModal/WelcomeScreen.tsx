import React, { Pressable, Text } from 'react-native';
import { modalStyles } from './modalStyles';

export const WelcomeScreen = ({
  setCurrentScreen,
}: {
  setCurrentScreen: any;
}) => {
  return (
    <>
      <Text style={modalStyles.header}>Instruction</Text>
      <Text style={modalStyles.textStyle}>
        Anon Aadhaar allows you to create a proof of your Aadhaar ID without
        revealing any personal data. Generate a QR code using the mAadhaar app
        (iOS/Android), by entering your Aadhaar number and OTP verification. You
        can then save the QR as an image using the &apos;Share&apos; button for
        import. This process is local to your browser for privacy, and QR images
        are not uploaded to any server. Note: Internet speed may affect
        processing time.
      </Text>
      <Pressable
        style={modalStyles.buttonGreen}
        onPress={() => setCurrentScreen('uploadQR')}
      >
        <Text style={modalStyles.buttonText}>Start</Text>
      </Pressable>
    </>
  );
};
