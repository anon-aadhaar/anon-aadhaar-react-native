/* eslint-disable react-native/no-inline-styles */
import * as React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  generateProof,
  setupMopro,
  verifyProof,
  AadhaarScanner,
  verifySignature,
} from '@anon-aadhaar/react-native';
import { useEffect, useState } from 'react';
import { circuitInputsFromQR } from '../../src/generateInputs';

export default function App() {
  const [setupReady, setSetupReady] = useState<boolean>(false);
  const [complexProof, setComplexProof] = useState<string | null>(null);
  const [publicInputs, setPublicInputs] = useState<string | null>(null);
  const [proofVerified, setProofVerified] = useState<boolean>(false);
  const [cameraOn, setCameraOn] = useState<boolean>(false);
  const [isProving, setIsProving] = useState<boolean>(false);
  const [isVerifyingSig, setIsVerifyingSig] = useState<boolean>(false);
  const [isQrScanned, setIsQrScanned] = useState<boolean>(false);
  const [sigVerified, setSigVerified] = useState<boolean>(false);
  const [anonAadhaarArgs, setAnonAadhaarArgs] = useState<{
    aadhaarData: string[];
    aadhaarDataLength: string[];
    signature: string[];
    pubKey: string[];
    signalHash: string[];
  } | null>(null);
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
      setIsQrScanned(true);
      verifySignature(qrCodeValue)
        .then((isVerified) => {
          if (isVerified) {
            setSigVerified(true);
            circuitInputsFromQR(qrCodeValue).then((args) => {
              setAnonAadhaarArgs(args);
              setIsVerifyingSig(false);
            });
          }
        })
        .catch((e) => {
          setIsVerifyingSig(false);
          console.error(e);
        });
    }
  }, [qrCodeValue]);

  const genProof = async () => {
    setIsProving(true);
    const startProof = Date.now();
    const { proof, inputs } = await generateProof(anonAadhaarArgs);
    setComplexProof(proof);
    setPublicInputs(inputs);
    setExecutionTime((prev) => ({ ...prev, proof: Date.now() - startProof }));
    setIsProving(false);
  };

  const verifProof = async (_proof: any, _publicInputs: any) => {
    const startVerif = Date.now();
    const res = await verifyProof(_proof, _publicInputs);
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
      <Text>Setup Execution Time: {executionTime.setup}ms</Text>
      {!isQrScanned && (
        <TouchableOpacity
          style={styles.button}
          onPress={() => setCameraOn(true)}
        >
          {isVerifyingSig ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Scan QR Code</Text>
          )}
        </TouchableOpacity>
      )}
      <AadhaarScanner
        cameraOn={cameraOn}
        setCameraOn={setCameraOn}
        setQrCodeValue={setQrCodeValue}
        setIsVerifyingSig={setIsVerifyingSig}
      />

      {isQrScanned && sigVerified && (
        <Text>QR Code Scanned and signature verified ✅</Text>
      )}

      <TouchableOpacity
        style={[
          styles.button,
          sigVerified ? styles.buttonEnabled : styles.buttonDisabled,
        ]}
        onPress={() => genProof()}
      >
        {isProving ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>Prove</Text>
        )}
      </TouchableOpacity>
      {complexProof ? (
        <Text>Proof Execution Time: {executionTime.proof}ms</Text>
      ) : (
        <></>
      )}
      <TouchableOpacity
        style={[
          styles.button,
          complexProof ? styles.buttonEnabled : styles.buttonDisabled,
        ]}
        onPress={() => verifProof(complexProof, publicInputs)}
      >
        <Text style={styles.buttonText}>Verify</Text>
      </TouchableOpacity>
      {proofVerified ? (
        <Text>Verification Execution Time: {executionTime.verify}ms</Text>
      ) : (
        <></>
      )}
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
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
    color: 'white',
  },
  buttonEnabled: {
    backgroundColor: '#64a8e3',
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  button: {
    backgroundColor: '#64a8e3',
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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
