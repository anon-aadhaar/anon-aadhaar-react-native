import React, { useState } from 'react';
import { OnboardingScreen } from './Screens/OnboardingScreen';
import { MainScreen } from './Screens/MainScreen';
// import BenchmarkView from './Screens/BenchmarkScreen';
// import { setupProver } from '@anon-aadhaar/react-native';

export type Views = 'Onboarding' | 'Main' | 'Benchmark';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Views>('Onboarding');
  // const [setupReady, setSetupReady] = useState<boolean>(true);

  // useEffect(() => {
  //   setupProver().then(() => {
  //     setSetupReady(true);
  //   });
  // }, [setupReady]);

  return (
    <>
      {currentScreen === 'Onboarding' && (
        <OnboardingScreen
          setCurrentScreen={setCurrentScreen}
          setupReady={true}
        />
      )}
      {currentScreen === 'Main' && <MainScreen />}
      {/* {currentScreen === 'Benchmark' && <BenchmarkView />} */}
    </>
  );
}
