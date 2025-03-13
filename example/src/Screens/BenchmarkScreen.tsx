/* eslint-disable react-native/no-inline-styles */
import {
  AadhaarScanner,
  type AnonAadhaarArgs,
  groth16ProveWithZKeyFilePath,
  groth16Verify,
  setupProver,
  verifySignature,
} from '@anon-aadhaar/react-native';
import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { circuitInputsFromQR } from '../../../src/generateInputs';
import type { AnonAadhaarProof } from '../../../src/types';
import { ZKEY_PATH, DAT_PATH } from '../../../src/constants';

const Toast = ({ message }: { message: string }) => (
  <View style={styles.toastContainer}>
    <Text style={styles.toastText}>{message}</Text>
  </View>
);

export default function BenchmarkView({}) {
  const [ready, setReady] = useState<boolean>(false);
  const [anonAadhaarProof, setAnonAadhaarProof] =
    useState<AnonAadhaarProof | null>(null);
  const [proofVerified, setProofVerified] = useState<boolean>(false);
  const [cameraOn, setCameraOn] = useState<boolean>(false);
  const [isProving, setIsProving] = useState<boolean>(false);
  const [isVerifyingSig, setIsVerifyingSig] = useState<boolean>(false);
  const [isQrScanned, setIsQrScanned] = useState<boolean>(false);
  const [sigVerified, setSigVerified] = useState<boolean>(false);
  // const [chunkPaths, setChunkPaths] = useState<string[]>([]);
  const [errorToastMessage, setErrorToastMessage] = useState<string | null>(
    null
  );
  const [anonAadhaarArgs, setAnonAadhaarArgs] =
    useState<AnonAadhaarArgs | null>(null);
  const [qrCodeValue, setQrCodeValue] = useState<string>('');
  const [executionTime, setExecutionTime] = useState<{
    setup: number;
    proof: number;
    verify: number;
  }>({ setup: 0, proof: 0, verify: 0 });

  useEffect(() => {
    if (qrCodeValue !== '') {
      setIsQrScanned(true);
      // Set true in verify to specify using Test Aadhaar
      verifySignature(qrCodeValue, true)
        .then((isVerified: boolean) => {
          if (isVerified) {
            setSigVerified(true);
            circuitInputsFromQR({
              qrData: qrCodeValue,
              nullifierSeed: 1234,
              isTestAadhaar: true,
            }).then((args) => {
              setAnonAadhaarArgs(args);
              setIsVerifyingSig(false);
            });
          }
        })
        .catch((e: any) => {
          setIsVerifyingSig(false);
          console.error(e);
        });
    }
  }, [qrCodeValue]);

  if (!ready) {
    const startSetup = Date.now();
    setupProver().then(() => {
      setReady(true);
      setExecutionTime((prev) => ({ ...prev, setup: Date.now() - startSetup }));
    });
  }

  const showToast = (message: string) => {
    setErrorToastMessage(message);
    setTimeout(() => setErrorToastMessage(null), 3000); // hide after 3 seconds
  };

  const genProof = async () => {
    try {
      setIsProving(true);
      const startProof = Date.now();
      if (!anonAadhaarArgs) throw Error('You must generate arguments first');

      const aaProof = await groth16ProveWithZKeyFilePath({
        zkeyFilePath: ZKEY_PATH,
        datFilePath: DAT_PATH,
        inputs: anonAadhaarArgs,
      });
      setExecutionTime((prev) => ({ ...prev, proof: Date.now() - startProof }));
      setAnonAadhaarProof(aaProof);
      console.log('Anon Aadhaar Proof received: ', aaProof);
      setIsProving(false);
    } catch (e) {
      setIsProving(false);
      if (e instanceof Error) {
        showToast(e.message);
      } else {
        throw new Error('generateProof: something went wrong!');
      }
    }
  };

  const verifProof = async (_proof: AnonAadhaarProof) => {
    try {
      const startVerif = Date.now();
      const res = await groth16Verify(ZKEY_PATH, _proof);
      console.log('Verification result: ', res);
      setProofVerified(res);
      setExecutionTime((prev) => ({
        ...prev,
        verify: Date.now() - startVerif,
      }));
    } catch (e) {
      if (e instanceof Error) {
        showToast(e.message);
      } else {
        throw new Error('verifProof: something went wrong!');
      }
    }
  };

  return (
    <View style={styles.container}>
      {errorToastMessage && <Toast message={errorToastMessage} />}

      <Text style={styles.title}>Anon Aadhaar Mobile</Text>
      <View style={styles.statusRow}>
        <View
          style={[
            styles.statusIndicator,
            { backgroundColor: ready ? 'green' : 'red' },
          ]}
        />
        <Text>Prover State: {String(ready)}</Text>
        {ready ? (
          <Text>Proof Execution Time: {executionTime.setup}ms</Text>
        ) : (
          <></>
        )}
      </View>
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
      {anonAadhaarProof ? (
        <Text>Proof Execution Time: {executionTime.proof}ms</Text>
      ) : (
        <></>
      )}
      <TouchableOpacity
        style={[
          styles.button,
          anonAadhaarProof ? styles.buttonEnabled : styles.buttonDisabled,
        ]}
        onPress={() => (anonAadhaarProof ? verifProof(anonAadhaarProof) : null)}
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
  toastContainer: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    backgroundColor: 'red',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000, // Make sure it's above other elements
  },
  toastText: {
    color: 'white',
  },
});
