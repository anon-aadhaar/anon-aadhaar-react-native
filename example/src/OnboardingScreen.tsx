import React, {
  useState,
  type FunctionComponent,
  useEffect,
  type SetStateAction,
  type Dispatch,
} from 'react';
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
import { CircularProgress } from './CircleProgress';
import { ProgressBar } from './ProgressBar';
import type { Views } from './App';

export type OnboardingScreenProps = {
  setupReady?: boolean;
  setCurrentScreen: Dispatch<SetStateAction<Views>>;
};

const images = [
  require('../assets/image1.png'),
  require('../assets/image2.png'),
  require('../assets/image3.png'),
  require('../assets/image4.png'),
  require('../assets/image5.png'),
];

const setupTime = 70000; // 70 seconds in milliseconds

export const OnboardingScreen: FunctionComponent<OnboardingScreenProps> = ({
  setupReady,
  setCurrentScreen,
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [setupProgress, setSetupProgress] = useState<number>(0);

  const incrementCounter = () => {
    setIsLoading(true);
    setActiveIndex((prevCounter) => (prevCounter === 4 ? 0 : prevCounter + 1));
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      incrementCounter();
    }, 8000);

    return () => clearInterval(intervalId);
  }, []);

  const onLoadEvent = () => {
    setIsLoading(false);
  };

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
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableOpacity
        style={styles.shortcut}
        onPress={() => setCurrentScreen('Benchmark')}
      >
        <Text style={styles.buttonText}>Go to benchmark</Text>
      </TouchableOpacity>
      <View style={styles.content}>
        <View style={styles.scrollView}>
          {isLoading && null}
          <Image
            source={images[activeIndex]}
            style={styles.topImage}
            onLoad={onLoadEvent}
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
              source={require('../assets/logo.png')}
              style={styles.brandLogo}
            />
          </View>

          {setupReady ? (
            <TouchableOpacity
              style={styles.button}
              onPress={() => setCurrentScreen('Main')}
            >
              <Text style={styles.buttonText}>Get started!</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.buttonDisabled}>
              <Text style={styles.buttonText}>Please wait...</Text>
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
    paddingVertical: 15,
    backgroundColor: '#06753b',
    borderRadius: 50,
  },
  shortcut: {
    paddingHorizontal: 70,
    paddingVertical: 15,
  },
  buttonDisabled: {
    paddingHorizontal: 70,
    paddingVertical: 15,
    backgroundColor: '#51785a',
    borderRadius: 50,
  },
  buttonText: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  logoContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
