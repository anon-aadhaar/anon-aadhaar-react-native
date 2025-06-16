/* eslint-disable react-native/no-inline-styles */
import { AnonAadhaarProve, useAnonAadhaar } from '@anon-aadhaar/react-native';
import React, { useEffect, type FunctionComponent } from 'react';
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from 'react-native';
import { SvgXml } from 'react-native-svg';

import { Footer } from '../Components/Footer';
import { icons } from '../Components/illustrations';

export type HomeScreenProps = {
  navigation: any;
};

export const HomeScreen: FunctionComponent<HomeScreenProps> = ({
  navigation,
}) => {
  const [anonAadhaarStatus, , , useTestAadhaar] = useAnonAadhaar();

  useEffect(() => {
    if (anonAadhaarStatus.status === 'logged-in') {
      console.log(anonAadhaarStatus.anonAadhaarProof);
    }
  }, [anonAadhaarStatus]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.scrollView}>
        <Text style={styles.heading}>Hey Anon,</Text>
        <View style={styles.greenSection}>
          <Image
            source={require('../../assets/home.png')}
            style={styles.topImage}
          />

          <View style={{ padding: 15, marginTop: 10 }}>
            <TouchableHighlight
              onLongPress={() => navigation.navigate('Benchmark')}
              underlayColor="white"
            >
              <View style={styles.tag}>
                <Text style={styles.callout}>
                  {anonAadhaarStatus.status === 'logged-in'
                    ? 'Verified'
                    : 'Not Verified'}
                </Text>
              </View>
            </TouchableHighlight>
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
              useTestAadhaar={useTestAadhaar}
            />
          </View>
        </View>
        {anonAadhaarStatus.status === 'logged-in' && (
          <TouchableOpacity
            style={styles.proofSection}
            onPress={() =>
              navigation.navigate('Proof', {
                anonAadhaarProof: anonAadhaarStatus.anonAadhaarProof,
              })
            }
          >
            <View style={styles.aaLogoContainer}>
              <View style={styles.aaLogo}>
                <SvgXml xml={icons.logoFrame} width="40" height="40" />
              </View>
            </View>
            <Text style={[styles.proofSectionText, { marginLeft: 10 }]}>
              View my proof
            </Text>
            <View
              style={{
                position: 'absolute',
                top: '50%',
                right: 10,
              }}
            >
              <SvgXml xml={icons.arrowRightLine} width="40" height="40" />
            </View>
          </TouchableOpacity>
        )}
      </View>
      <Footer navigation={navigation} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  aaLogo: {
    left: '50%',
    position: 'absolute',
    top: '50%',
    transform: [{ translateX: -14 }, { translateY: -14 }],
  },
  aaLogoContainer: {
    alignItems: 'center',
    backgroundColor: 'black',
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  buttonText: {
    color: '#06753b',
    fontFamily: 'Outfit-Light',
    textAlign: 'center',
  },
  callout: {
    color: 'white',
    fontFamily: 'Outfit-Regular',
    fontSize: 16,
  },
  footnote: {
    color: 'white',
    fontFamily: 'Outfit-Light',
    fontSize: 14,
    lineHeight: 15,
  },
  greenSection: {
    backgroundColor: '#06753B',
    borderRadius: 10,
    height: 480,
    marginVertical: 20,
  },
  heading: {
    color: '#FFFFFF',
    fontFamily: 'Outfit-Bold',
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'left',
  },
  proofSection: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#3E3B3B',
    borderRadius: 8,
    elevation: 8,
    flexDirection: 'row',
    marginVertical: 4,
    minHeight: 60,
    paddingHorizontal: 20,
    paddingVertical: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    width: '100%',
  },
  proofSectionText: {
    color: 'white',
    fontFamily: 'Outfit-Bold',
    fontSize: 20,
    textAlign: 'left',
  },
  roundButton: {
    backgroundColor: 'transparent',
    borderRadius: 50,
    marginTop: 20,
    width: '100%',
  },
  safeArea: {
    backgroundColor: '#000000',
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  tag: {
    alignItems: 'center',
    backgroundColor: 'black',
    borderRadius: 8,
    justifyContent: 'center',
    padding: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    width: '40%',
  },
  title: {
    color: '#FFFFFF',
    fontFamily: 'Outfit-Bold',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'left',
  },
  topImage: {
    alignSelf: 'center',
    height: '50%',
    resizeMode: 'contain',
    width: '100%',
  },
});
