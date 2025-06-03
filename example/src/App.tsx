import { setupProver, AnonAadhaarProvider } from '@anon-aadhaar/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useState, useEffect } from 'react';

import { AboutScreen } from './Screens/AboutScreen';
import BenchmarkView from './Screens/BenchmarkScreen';
import { HomeScreen } from './Screens/HomeScreen';
import { OnboardingScreen } from './Screens/OnboardingScreen';
import { ProofScreen } from './Screens/ProofScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [setupReady, setSetupReady] = useState<boolean>(false);

  useEffect(() => {
    setupProver().then(() => {
      setSetupReady(true);
    });
  }, []);

  return (
    <AnonAadhaarProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Onboarding">
          <Stack.Screen name="Onboarding" options={{ headerShown: false }}>
            {(props) => <OnboardingScreen {...props} setupReady={setupReady} />}
          </Stack.Screen>

          <Stack.Screen name="Proof" options={{ headerShown: false }}>
            {(props) => <ProofScreen {...props} />}
          </Stack.Screen>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Benchmark"
            component={BenchmarkView}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="About"
            component={AboutScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AnonAadhaarProvider>
  );
}
