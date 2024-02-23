import * as React from 'react';

import { StyleSheet, View, Text } from 'react-native';
import { setupMopro } from '@anon-aadhaar/react-native';
import { useEffect } from 'react';

export default function App() {
  // const [result, setResult] = useState(false);

  useEffect(() => {
    setupMopro();
  }, []);

  return (
    <View style={styles.container}>
      <Text>Hello World!</Text>
      {/* <Text>Result: {result}</Text> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
