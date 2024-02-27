import * as React from 'react';

import { StyleSheet, View, Text, Button } from 'react-native';
import {
  generateProof,
  setupMopro,
  verifyProof,
} from '@anon-aadhaar/react-native';
import { useEffect, useState } from 'react';
import data from './input.json';

export default function App() {
  const [result, setResult] = useState<'ready' | 'not-ready'>('not-ready');
  const [complexProof, setComplexProof] = useState<string | null>(null);
  const [publicInputs, setPublicInputs] = useState<string | null>(null);
  const [proofVerified, setProofVerified] = useState<boolean>(false);

  useEffect(() => {
    try {
      setupMopro().then(() => setResult('ready'));
    } catch (e) {
      console.log(e);
    }
  }, []);

  const genProof = async () => {
    const input = {
      aadhaarData: data.aadhaar_data,
      aadhaarDataLength: [data.aadhaarDataLength.toString()],
      signature: data.signature,
      pubKey: data.pub_key,
      signalHash: [data.signalHash.toString()],
    };
    const { proof, inputs } = await generateProof(input);
    setComplexProof(proof);
    setPublicInputs(inputs);
  };

  const verifProof = async (proof: any, publicInputs: any) => {
    const res = await verifyProof(proof, publicInputs);
    setProofVerified(res);
  };

  return (
    <View style={styles.container}>
      <Text>Hello World!</Text>
      <Text>Prover State: {result} </Text>
      <Button
        onPress={() => genProof()}
        title="Prove"
        color="#841584"
        accessibilityLabel="Generate a zkp"
      />
      <Button
        onPress={() => verifProof(complexProof, publicInputs)}
        title="Verify"
        color="#841584"
        accessibilityLabel="Verify a zkp"
      />
      <Text>Prover Verified: {String(proofVerified)} </Text>
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
