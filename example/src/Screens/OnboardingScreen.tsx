import LottieView from 'lottie-react-native';
import React, { useState, type FunctionComponent, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SvgXml } from 'react-native-svg';

import * as messages from '../../assets/messages.json';
import { CircularProgress } from '../Components/CircleProgress';
import { ProgressBar } from '../Components/ProgressBar';
import { icons } from '../Components/illustrations';

export type OnboardingScreenProps = {
  setupReady?: boolean;
  navigation: any;
};

const lotties = [
  require('../../assets/lotties/1.Validate.json'),
  require('../../assets/lotties/2.Leveraging.json'),
  require('../../assets/lotties/3.Authenticate.json'),
  require('../../assets/lotties/4.Embrace.json'),
  require('../../assets/lotties/5.Foster.json'),
];

const setupTime = 60000; // 60 seconds in milliseconds

export const OnboardingScreen: FunctionComponent<OnboardingScreenProps> = ({
  setupReady,
  navigation,
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [setupProgress, setSetupProgress] = useState<number>(0);

  useEffect(() => {
    if (setupReady) setSetupProgress(1);
  }, [setupReady]);

  const incrementCounter = () => {
    setIsLoading(true);
    setActiveIndex((prevCounter) => (prevCounter === 4 ? 0 : prevCounter + 1));
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      incrementCounter();
    }, 4000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSetupProgress((prevProgress) => {
        if (prevProgress < 1) {
          return prevProgress + 1 / (setupTime / 1000);
        } else {
          clearInterval(interval);
          return 1;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [setupReady]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.scrollView}>
          {isLoading && null}
          {/* <Image
            source={images[activeIndex]}
            style={styles.topImage}
            onLoad={onLoadEvent}
          /> */}
          <LottieView
            source={lotties[activeIndex]}
            style={styles.topImage}
            autoPlay
            loop
          />

          <Text style={styles.heading}>
            {messages[activeIndex.toString() as keyof typeof messages].headline}
          </Text>
          <Text style={styles.subHeading}>
            {messages[activeIndex.toString() as keyof typeof messages].subline}
          </Text>
          <ProgressBar currentIndex={activeIndex} itemCount={5} />
        </View>
        <View style={styles.footer}>
          <View style={styles.logoContainer}>
            <CircularProgress
              size={65}
              strokeWidth={3}
              progress={setupProgress}
            />
            <Image
              source={require('../../assets/logo.png')}
              style={styles.brandLogo}
            />
          </View>

          {setupReady ? (
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('Home')}
            >
              <SvgXml xml={icons.arrowRightLine} width="24" height="24" />
            </TouchableOpacity>
          ) : (
            <View style={styles.buttonDisabled}>
              <SvgXml xml={icons.arrowRightLine} width="24" height="24" />
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const screenWidth = Dimensions.get('window').width;
const styles = StyleSheet.create({
  brandLogo: {
    height: 50,
    resizeMode: 'contain',
    width: 50,
  },
  button: {
    backgroundColor: '#06753b',
    borderRadius: 50,
    paddingHorizontal: 70,
    paddingVertical: 15,
  },
  buttonDisabled: {
    backgroundColor: '#51785a',
    borderRadius: 50,
    paddingHorizontal: 70,
    paddingVertical: 15,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 20,
    paddingHorizontal: 20,
    width: '100%',
  },
  heading: {
    color: '#FFFFFF',
    fontFamily: 'Outfit-Bold',
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'left',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  safeArea: {
    backgroundColor: '#000000',
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  shortcut: {
    paddingHorizontal: 70,
    paddingVertical: 15,
  },
  subHeading: {
    color: '#b8b8b8',
    fontFamily: 'Outfit-Regular',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'left',
  },
  topImage: {
    width: screenWidth - 40, // Assuming 20 padding on each side
    height: (screenWidth - 40) * (416 / 390),
    resizeMode: 'contain',
  },
});
