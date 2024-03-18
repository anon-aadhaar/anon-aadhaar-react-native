import React from 'react';
import {
  SafeAreaView,
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';

export default function OnboardingScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.scrollView}>
          <Image
            source={require('../assets/image.png')}
            style={styles.topImage}
          />
          <Text style={styles.heading}>
            Validate Aadhaar ownership seamlessly
          </Text>
          <Text style={styles.subHeading}>
            Dive into the Anon Aadhaar protocol with this tool. It utilizes
            zero-knowledge to ensure your privacy while impressing you from the
            start.
          </Text>
        </View>
        <View style={styles.footer}>
          <Image
            source={require('../assets/logo.png')}
            style={styles.brandLogo}
          />
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>→</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const screenWidth = Dimensions.get('window').width;
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  topImage: {
    width: screenWidth - 40, // Assuming 20 padding on each side
    height: (screenWidth - 40) * (416 / 390),
    resizeMode: 'contain',
    marginTop: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  heading: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'left',
    marginTop: 20,
  },
  subHeading: {
    fontSize: 16,
    color: '#b8b8b8',
    textAlign: 'left',
    marginTop: 10,
  },
  brandLogo: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  button: {
    paddingHorizontal: 70,
    paddingVertical: 10,
    backgroundColor: '#306030',
    borderRadius: 50,
  },
  buttonText: {
    fontSize: 24,
    color: '#FFFFFF',
  },
});
