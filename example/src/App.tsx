import React, { useEffect, useState } from 'react';
import { setupMopro } from '@anon-aadhaar/react-native';
import { OnboardingScreen } from './OnboardingScreen';

export default function App() {
  const [setupReady, setSetupReady] = useState<boolean>(false);

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

  return <OnboardingScreen setupReady={setupReady} />;
}
