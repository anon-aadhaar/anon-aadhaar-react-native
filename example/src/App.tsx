import * as React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import {
  generateProof,
  setupMopro,
  verifyProof,
  AadhaarScanner,
  verifySignature,
} from '@anon-aadhaar/react-native';
import { useEffect, useState } from 'react';
import data from './input.json';

export default function App() {
  const [setupReady, setSetupReady] = useState<boolean>(false);
  const [complexProof, setComplexProof] = useState<string | null>(null);
  const [publicInputs, setPublicInputs] = useState<string | null>(null);
  const [proofVerified, setProofVerified] = useState<boolean>(false);
  const [cameraOn, setCameraOn] = useState<boolean>(true);
  const [qrCodeValue, setQrCodeValue] = useState<string>('');
  const [executionTime, setExecutionTime] = useState<{
    setup: number;
    proof: number;
    verify: number;
  }>({ setup: 0, proof: 0, verify: 0 });

  useEffect(() => {
    const startSetup = Date.now();
    try {
      if (!setupReady) {
        setupMopro().then(() => {
          setSetupReady(true);
          setExecutionTime((prev) => ({
            ...prev,
            setup: Date.now() - startSetup,
          }));
        });
      }
    } catch (e) {
      console.log(e);
    }
  }, [setupReady]);

  useEffect(() => {
    if (qrCodeValue !== '') {
      verifySignature(qrCodeValue, true)
        .then((isVerified) =>
          console.log('QR Code signature veirified: ', isVerified)
        )
        .catch((e) => console.error(e));
    }
  }, [qrCodeValue]);

  const genProof = async () => {
    const startProof = Date.now();
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
    setExecutionTime((prev) => ({ ...prev, proof: Date.now() - startProof }));
  };

  const verifProof = async (proof: any, publicInputs: any) => {
    const startVerif = Date.now();
    const res = await verifyProof(proof, publicInputs);
    setProofVerified(res);
    setExecutionTime((prev) => ({ ...prev, verify: Date.now() - startVerif }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Anon Aadhaar Mobile</Text>
      <View style={styles.statusRow}>
        <View
          style={[
            styles.statusIndicator,
            { backgroundColor: setupReady ? 'green' : 'red' },
          ]}
        />
        <Text>Prover State: {String(setupReady)}</Text>
      </View>
      <AadhaarScanner
        cameraOn={cameraOn}
        setCameraOn={setCameraOn}
        setQrCodeValue={setQrCodeValue}
      />
      <Text>Setup Execution Time: {executionTime.setup}ms</Text>
      <TouchableOpacity style={styles.button} onPress={() => genProof()}>
        <Text style={styles.buttonText}>Prove</Text>
      </TouchableOpacity>
      <Text>Proof Execution Time: {executionTime.proof}ms</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => verifProof(complexProof, publicInputs)}
      >
        <Text style={styles.buttonText}>Verify</Text>
      </TouchableOpacity>
      <Text>Verification Execution Time: {executionTime.verify}ms</Text>
      <View style={styles.statusRow}>
        <View
          style={[
            styles.statusIndicator,
            { backgroundColor: proofVerified ? 'green' : 'red' },
          ]}
        />
        <Text>Prover Verified: {String(proofVerified)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
    color: 'white',
  },
  button: {
    backgroundColor: '#841584',
    padding: 15,
    width: '90%',
    alignItems: 'center',
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    color: 'white',
  },
  statusIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 10,
    color: 'white',
  },
  statusText: {
    fontSize: 16,
    color: 'white',
  },
});
