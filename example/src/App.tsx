import React, { useState } from 'react';
import { OnboardingScreen } from './OnboardingScreen';
import { MainScreen } from './MainScreen';
import BenchmarkView from './BenchmarkView';

export type Views = 'Onboarding' | 'Main' | 'Benchmark';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Views>('Onboarding');

  return (
    <>
      {currentScreen === 'Onboarding' && (
        <OnboardingScreen setCurrentScreen={setCurrentScreen} />
      )}
      {currentScreen === 'Main' && <MainScreen />}
      {currentScreen === 'Benchmark' && <BenchmarkView />}
    </>
  );
}
