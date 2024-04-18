import React, { useState, useEffect } from 'react';
import { OnboardingScreen } from './Screens/OnboardingScreen';
import { MainScreen } from './Screens/MainScreen';
import BenchmarkView from './Screens/BenchmarkScreen';
import { setupProver } from '@anon-aadhaar/react-native';
import { AnonAadhaarProvider } from '../../src/provider/AnonAadhaarProvider';

export type Views = 'Onboarding' | 'Main' | 'Benchmark';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Views>('Onboarding');
  const [setupReady, setSetupReady] = useState<boolean>(false);

  useEffect(() => {
    setupProver().then(() => {
      setSetupReady(true);
    });
  }, []);

  return (
    <AnonAadhaarProvider>
      {currentScreen === 'Onboarding' && (
        <OnboardingScreen
          setCurrentScreen={setCurrentScreen}
          setupReady={setupReady}
        />
      )}
      {currentScreen === 'Main' && <MainScreen />}
      {currentScreen === 'Benchmark' && <BenchmarkView />}
    </AnonAadhaarProvider>
  );
}
