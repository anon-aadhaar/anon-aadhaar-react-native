import React, { type FunctionComponent } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ProveModal } from '@anon-aadhaar/react-native';

// const img = require('../assets/img-home.png');

export type MainScreenProps = {
  //
};

export const MainScreen: FunctionComponent<MainScreenProps> = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.scrollView}>
        <Text style={styles.heading}>Hey Anon,</Text>
        <View style={styles.greenSection}>
          {/* <Image source={img} style={styles.topImage} /> */}
          <Text style={styles.title}>Proof of identity</Text>
          <TouchableOpacity style={styles.buttonWhite}>
            <Text style={styles.buttonText}>Start</Text>
          </TouchableOpacity>
          <ProveModal
            buttonMessage="Start"
            signal="0xa527e0029e720D5f31c8798DF7b107Fad54f40E6"
            nullifierSeed={1234}
            fieldsToRevealArray={['revealAgeAbove18', 'revealState']}
          />
        </View>
        {/* {proofs && (
          <View style={styles.orangeSection}>
            <Text style={styles.proofSectionText}>
              Identity Proof #1 - 03/19/20204
            </Text>
          </View>
        )} */}
      </View>
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
  },
  greenSection: {
    justifyContent: 'space-between',
    backgroundColor: '#51785A',
    height: 400,
    marginVertical: 20,
    borderRadius: 10,
    paddingLeft: 20,
  },
  buttonWhite: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    alignSelf: 'center',
    paddingHorizontal: 50,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderRadius: 50,
    marginTop: 20,
  },
  buttonText: {
    fontFamily: 'Outfit-Light',
    color: '#06753b',
    textAlign: 'center',
  },
  orangeSection: {
    justifyContent: 'space-between',
    backgroundColor: '#ec834b',
    marginVertical: 10,
    borderRadius: 10,
    padding: 10,
  },
  proofSectionText: {
    fontFamily: 'Outfit-Bold',
    color: 'white',
    textAlign: 'left',
  },
  topImage: {
    resizeMode: 'contain',
  },
});
