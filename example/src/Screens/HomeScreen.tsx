/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState, type FunctionComponent } from 'react';
import { Image, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { AnonAadhaarProve, useAnonAadhaar } from '@anon-aadhaar/react-native';
import { Footer } from '../Components/Footer';

const img = require('../../assets/home.png');

export type HomeScreenProps = {
  navigation: any;
};

export const HomeScreen: FunctionComponent<HomeScreenProps> = ({
  navigation,
}) => {
  const [anonAadhaarStatus] = useAnonAadhaar();
  const [anonAadhaarProof, setAnonAadhaarProof] = useState<any>(null);

  useEffect(() => {
    console.log(anonAadhaarStatus);
    if (anonAadhaarStatus.status === 'logged-in') {
      setAnonAadhaarProof(anonAadhaarStatus.anonAadhaarProof);
    }
  }, [anonAadhaarStatus]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.scrollView}>
        <Text style={styles.heading}>Hey Anon,</Text>
        <View style={styles.greenSection}>
          <Image source={img} style={styles.topImage} />
          <View style={{ padding: 15, marginTop: 10 }}>
            <View style={styles.tag}>
              <Text style={styles.callout}>
                {anonAadhaarStatus.status === 'logged-in'
                  ? 'Verified'
                  : 'Not Verified'}
              </Text>
            </View>
            <Text style={styles.title}>Proof of identity</Text>
            <Text style={styles.footnote}>
              A zero-knowledge proof generated for confirming the authenticity
              of your Aadhaar card without revealing any personal data.
            </Text>

            <AnonAadhaarProve
              buttonMessage="Start"
              signal="0xa527e0029e720D5f31c8798DF7b107Fad54f40E6"
              nullifierSeed={1234}
              fieldsToRevealArray={['revealAgeAbove18', 'revealState']}
              useTestAadhaar={true}
            />
          </View>
        </View>
        {anonAadhaarProof && (
          <View style={styles.proofSection}>
            <Image
              source={require('../../assets/logo.png')}
              style={{ width: 40, height: 40, marginRight: 16 }}
            />
            <Text style={styles.proofSectionText}>View my proof</Text>
          </View>
        )}
      </View>
      <Footer navigation={navigation} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  heading: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'left',
    marginTop: 20,
    fontFamily: 'Outfit-Bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'left',
    marginTop: 20,
    fontFamily: 'Outfit-Bold',
  },
  scrollView: {
    justifyContent: 'center',
    padding: 20,
    flex: 1,
  },
  greenSection: {
    backgroundColor: '#06753B',
    height: 480,
    marginVertical: 20,
    borderRadius: 10,
  },
  tag: {
    backgroundColor: 'black',
    borderRadius: 8,
    padding: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '40%',
  },
  footnote: {
    fontFamily: 'Outfit-Light',
    fontSize: 14,
    color: 'white',
    lineHeight: 15,
  },
  callout: {
    fontFamily: 'Outfit-Regular',
    fontSize: 16,
    color: 'white',
    lineHeight: 15,
  },
  roundButton: {
    width: '100%',
    backgroundColor: 'transparent',
    borderRadius: 50,
    marginTop: 20,
  },
  buttonText: {
    fontFamily: 'Outfit-Light',
    color: '#06753b',
    textAlign: 'center',
  },
  proofSection: {
    width: '100%',
    minHeight: 60,
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#3E3B3B',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    alignSelf: 'center',
    marginVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  proofSectionText: {
    fontFamily: 'Outfit-Bold',
    color: 'white',
    textAlign: 'left',
    fontSize: 20,
  },
  topImage: {
    width: '100%',
    height: '50%',
    resizeMode: 'contain',
    alignSelf: 'center',
  },
});
