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
import { Footer } from '../Components/Footer';

type AboutProps = {
  navigation: any;
};

export const AboutScreen: FunctionComponent<AboutProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.scrollView}>
        <Text style={styles.heading}>Resources</Text>

        <TouchableOpacity style={styles.infoContainer}>
          <View style={[styles.infoIcon, { backgroundColor: '#06753B' }]}>
            <SvgXml xml={icons.bookMarkLine} width="40" height="40" />
          </View>
          <Text style={styles.infoText}>Anon Aadhaar Documentation</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.infoContainer}>
          <View style={[styles.infoIcon, { backgroundColor: '#E86A33' }]}>
            <SvgXml xml={icons.window2Line} width="40" height="40" />
          </View>
          <Text style={styles.infoText}>Other sample app - Web version</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.infoContainer}>
          <View style={[styles.infoIcon, { backgroundColor: '#189DCF' }]}>
            <SvgXml xml={icons.telegramLine} width="40" height="40" />
          </View>
          <Text style={styles.infoText}>Telegram community chat</Text>
        </TouchableOpacity>

        <View style={{ gap: 5 }}>
          <Text style={styles.title}>About</Text>
          <Text style={styles.footnote}>
            This mobile application has been developed by the core contributors
            of the Anon Aadhaar team, aiming to demonstrate the capabilities of
            the Anon Aadhaar protocol within a mobile environment. We have
            incorporated MoPro as the primary proving system to enhance the user
            experience. If you are interested in learning more, we invite you to
            join our Telegram group for further information.
          </Text>

          <View style={{ marginTop: 5 }}>
            <Text style={styles.footnote}>Release date: April, 2024</Text>
            <Text style={styles.footnote}>Version: 1.0</Text>
          </View>
        </View>
      </View>
      <Footer navigation={navigation} />
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
    flex: 1,
  },
  footnote: {
    fontFamily: 'Outfit-Light',
    fontSize: 14,
    color: 'white',
    lineHeight: 16,
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
