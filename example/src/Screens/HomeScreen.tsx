/* eslint-disable react-native/no-inline-styles */
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
import { AnonAadhaarProve, useAnonAadhaar } from '@anon-aadhaar/react-native';
import { Footer } from '../Components/Footer';
import { icons } from '../Components/illustrations';
import { SvgXml } from 'react-native-svg';

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
  aaLogo: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -14 }, { translateY: -14 }],
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
    padding: 20,
    flex: 1,
  },
  greenSection: {
    backgroundColor: '#06753B',
    height: 480,
    marginVertical: 20,
    borderRadius: 10,
  },
  aaLogoContainer: {
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    width: 40,
    height: 40,
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
