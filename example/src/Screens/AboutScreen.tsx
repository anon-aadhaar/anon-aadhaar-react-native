/* eslint-disable react-native/no-inline-styles */
import { AnonAadhaarContext } from '@anon-aadhaar/react-native';
import React, { useContext, type FunctionComponent } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
  Switch,
} from 'react-native';
import { SvgXml } from 'react-native-svg';

import Divider from '../Components/Divider';
import { Footer } from '../Components/Footer';
import { icons } from '../Components/illustrations';

type AboutProps = {
  navigation: any;
};

export const AboutScreen: FunctionComponent<AboutProps> = ({ navigation }) => {
  const { useTestAadhaar, setUseTestAadhaar } = useContext(AnonAadhaarContext);
  const toggleSwitch = () => setUseTestAadhaar(!useTestAadhaar);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.scrollView}>
        <Text style={styles.heading}>Resources</Text>

        <TouchableOpacity
          style={styles.infoContainer}
          onPress={() => {
            Linking.openURL('https://anon-aadhaar-documentation.vercel.app/');
          }}
        >
          <View style={[styles.infoIcon, { backgroundColor: '#06753B' }]}>
            <SvgXml xml={icons.bookMarkLine} width="40" height="40" />
          </View>
          <Text style={styles.infoText}>Anon Aadhaar Documentation</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.infoContainer}
          onPress={() => {
            Linking.openURL('https://quick-setup.vercel.app/');
          }}
        >
          <View style={[styles.infoIcon, { backgroundColor: '#E86A33' }]}>
            <SvgXml xml={icons.window2Line} width="40" height="40" />
          </View>
          <Text style={styles.infoText}>Other sample app - Web version</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.infoContainer}
          onPress={() => {
            Linking.openURL('https://t.me/anon_aadhaar');
          }}
        >
          <View style={[styles.infoIcon, { backgroundColor: '#189DCF' }]}>
            <SvgXml xml={icons.telegramLine} width="40" height="40" />
          </View>
          <Text style={styles.infoText}>Telegram community chat</Text>
        </TouchableOpacity>

        <View style={{ marginTop: 10 }}>
          <Divider />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: 5,
            }}
          >
            <Text
              style={{
                color: 'white',
                fontSize: 18,
                marginVertical: 10,
                fontWeight: 'bold',
              }}
            >
              Use test mode:{' '}
            </Text>
            <Switch
              trackColor={{ false: '#767577', true: '#9DB8A1' }}
              thumbColor={useTestAadhaar ? '#06753B' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleSwitch}
              value={useTestAadhaar}
            />
          </View>
          <Divider />
        </View>

        <View style={{ gap: 5 }}>
          <Text style={styles.title}>About</Text>
          <Text style={styles.footnote}>
            This mobile application has been developed by the Anon Aadhaar team,
            aiming to demonstrate the capabilities of the protocol within a
            mobile environment. We have incorporated RapidSnark and witnescalc
            as the primary proving system to enhance the user experience. If you
            are interested in learning more, we invite you to join our Telegram
            group.
          </Text>

          <View style={{ marginTop: 5 }}>
            <Text style={styles.footnote}>
              <Text style={{ fontWeight: 'bold' }}>Release date:</Text> April,
              2024
            </Text>
            <Text style={styles.footnote}>
              <Text style={{ fontWeight: 'bold' }}>Version:</Text> 1.0
            </Text>
          </View>
        </View>
      </View>
      <Footer navigation={navigation} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  callout: {
    color: 'white',
    fontFamily: 'Outfit-Regular',
    fontSize: 16,
    lineHeight: 15,
  },
  footnote: {
    color: 'white',
    fontFamily: 'Outfit-Light',
    fontSize: 14,
    lineHeight: 16,
  },
  heading: {
    color: '#FFFFFF',
    fontFamily: 'Outfit-Bold',
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'left',
  },
  infoContainer: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#3E3B3B',
    borderRadius: 8,
    elevation: 8,
    flexDirection: 'row',
    marginVertical: 4,
    minHeight: 100,
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
  infoIcon: {
    alignItems: 'center',
    backgroundColor: '#E93CAE',
    borderRadius: 8,
    height: 80,
    justifyContent: 'center',
    width: 80,
  },
  infoText: {
    color: '#FFFFFF',
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 15,
    textAlign: 'left',
  },
  safeArea: {
    backgroundColor: '#000000',
    flex: 1,
  },
  scrollView: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    color: '#FFFFFF',
    fontFamily: 'Outfit-Bold',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'left',
  },
});
