import React, { useEffect, useState } from 'react';
import { setupMopro } from '@anon-aadhaar/react-native';
import { OnboardingScreen } from './OnboardingScreen';
import { MainScreen } from './MainScreen';
import BenchmarkView from './BenchmarkView';

export type Views = 'Onboarding' | 'Main' | 'Benchmark';

export default function App() {
  const [setupReady, setSetupReady] = useState<boolean>(false);
  const [currentScreen, setCurrentScreen] = useState<Views>('Onboarding');

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
      {currentScreen === 'Benchmark' && (
        <BenchmarkView setupReady={setupReady} />
      )}
    </>
  );
}
