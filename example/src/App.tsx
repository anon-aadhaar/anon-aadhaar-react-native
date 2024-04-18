import React, { useState, useEffect } from 'react';
import { OnboardingScreen } from './Screens/OnboardingScreen';
import { HomeScreen } from './Screens/HomeScreen';
import BenchmarkView from './Screens/BenchmarkScreen';
import { setupProver } from '@anon-aadhaar/react-native';
import { AnonAadhaarProvider } from '../../src/provider/AnonAadhaarProvider';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AboutScreen } from './Screens/AboutScreen';

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
