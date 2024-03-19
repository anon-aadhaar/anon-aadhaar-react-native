import React, { useEffect, useState } from 'react';
import { setupMopro } from '@anon-aadhaar/react-native';
import { OnboardingScreen } from './OnboardingScreen';
import { MainScreen } from './MainScreen';

export default function App() {
  const [setupReady, setSetupReady] = useState<boolean>(false);
  const [currentScreen, setCurrentScreen] = useState<string>('Onboarding');

  useEffect(() => {
    try {
      if (!setupReady) {
        setupMopro().then(() => {
          setSetupReady(true);
        });
      }
    } catch (e) {
      console.log(e);
    }
  }, [setupReady]);

  return (
    <>
      {currentScreen === 'Onboarding' && (
        <OnboardingScreen
          setupReady={setupReady}
          setCurrentScreen={setCurrentScreen}
        />
      )}
      {currentScreen === 'Main' && <MainScreen />}
    </>
  );
}
