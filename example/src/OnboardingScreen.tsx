import React, { useState, type FunctionComponent } from 'react';
import {
  SafeAreaView,
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import messages from '../assets/messages.json';

export type OnboardingScreenProps = {
  setupReady: boolean;
};

const images = [
  require('../assets/image1.png'),
  require('../assets/image2.png'),
  require('../assets/image3.png'),
  require('../assets/image4.png'),
  require('../assets/image5.png'),
];

export const OnboardingScreen: FunctionComponent<OnboardingScreenProps> = ({
  setupReady,
}) => {
  const [counter, setCounter] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const incrementCounter = () => {
    setIsLoading(true);
    setCounter((prevCounter) => (prevCounter === 5 ? 1 : prevCounter + 1));
  };

  const onLoadEvent = () => {
    setIsLoading(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.scrollView}>
          {isLoading && null}
          <Image
            source={images[counter]}
            style={styles.topImage}
            onLoad={onLoadEvent}
          />

          <Text style={styles.heading}>
            {messages[counter.toString() as keyof typeof messages].headline}
          </Text>
          <Text style={styles.subHeading}>
            {messages[counter.toString() as keyof typeof messages].subline}
          </Text>
        </View>
        <View style={styles.footer}>
          <Image
            source={require('../assets/logo.png')}
            style={styles.brandLogo}
          />
          {counter === 5 ? (
            setupReady ? (
              <TouchableOpacity
                style={styles.button}
                onPress={incrementCounter}
              >
                <Text style={styles.buttonText}>Get started!</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.buttonDisabled}>
                <Text style={styles.buttonText}>Get started!</Text>
              </TouchableOpacity>
            )
          ) : (
            <TouchableOpacity style={styles.button} onPress={incrementCounter}>
              <Text style={styles.buttonText}>→</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

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
    fontFamily: 'Outfit-Bold',
  },
  subHeading: {
    fontSize: 16,
    color: '#b8b8b8',
    textAlign: 'left',
    marginTop: 10,
    fontFamily: 'Outfit-Regular',
  },
  brandLogo: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  button: {
    paddingHorizontal: 70,
    paddingVertical: 10,
    backgroundColor: '#06753b',
    borderRadius: 50,
  },
  buttonDisabled: {
    paddingHorizontal: 70,
    paddingVertical: 10,
    backgroundColor: '#51785a',
    borderRadius: 50,
  },
  buttonText: {
    fontSize: 24,
    color: '#FFFFFF',
  },
});
