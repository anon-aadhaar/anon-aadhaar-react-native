import React, { type FunctionComponent } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export type MainScreenProps = {
  //
};

export const MainScreen: FunctionComponent<MainScreenProps> = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.scrollView}>
        <Text style={styles.heading}>Hey Anon,</Text>
        <View style={styles.greenSection}>
          <Text style={styles.title}>Proof of identity</Text>
          <TouchableOpacity style={styles.buttonWhite}>
            <Text style={styles.buttonText}>Start</Text>
          </TouchableOpacity>
        </View>
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
});
