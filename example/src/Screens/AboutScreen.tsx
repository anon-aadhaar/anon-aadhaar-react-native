/* eslint-disable react-native/no-inline-styles */
import React, { type FunctionComponent } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { icons } from '../Components/illustrations';
import { SvgXml } from 'react-native-svg';

export const AboutScreen: FunctionComponent = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.scrollView}>
        <Text style={styles.heading}>Resources</Text>

        <TouchableOpacity style={styles.infoContainer}>
          <View style={styles.infoIcon}>
            <SvgXml xml={icons.bookMarkLine} width="30" height="30" />
          </View>
          <Text style={styles.infoText}>
            Scan QR code from the letter or PDF
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.infoContainer}>
          <View style={styles.infoIcon}>
            <SvgXml xml={icons.window2Line} width="30" height="30" />
          </View>
          <Text style={styles.infoText}>
            Scan QR code from the letter or PDF
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.infoContainer}>
          <View style={styles.infoIcon}>
            <SvgXml xml={icons.telegramLine} width="30" height="30" />
          </View>
          <Text style={styles.infoText}>
            Scan QR code from the letter or PDF
          </Text>
        </TouchableOpacity>

        <Text style={styles.title}>Proof of identity</Text>
        <Text style={styles.footnote}>
          A zero-knowledge proof generated for confirming the authenticity of
          your Aadhaar card without revealing any personal data.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  infoIcon: {
    width: 95,
    height: 95,
    backgroundColor: '#E93CAE',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'left',
    marginLeft: 15,
  },
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
  infoContainer: {
    width: '100%',
    minHeight: 120,
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
});
