import * as React from 'react';
import RNFS from 'react-native-fs';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  // Platform,
} from 'react-native';
import {
  type AnonAadhaarArgs,
  groth16ProveWithZKeyFilePath,
  AadhaarScanner,
  verifySignature,
  groth16Verify,
  setupProver,
} from '@anon-aadhaar/react-native';
import { useEffect, useState } from 'react';
import { circuitInputsFromQR } from '../../src/generateInputs';

const Toast = ({ message }: { message: string }) => (
  <View style={styles.toastContainer}>
    <Text style={styles.toastText}>{message}</Text>
  </View>
);

// const zkeyChunksFolderPath = RNFS.DocumentDirectoryPath + '/chunked';
const zkeyFilePath = RNFS.DocumentDirectoryPath + '/circuit_final.zkey';
const DatFilePath = RNFS.DocumentDirectoryPath + '/aadhaar-verifier.dat';

function getVerificationKey(): Promise<string> {
  const path = RNFS.DocumentDirectoryPath + '/vkey.json';
  return RNFS.readFile(path, 'utf8');
}

export default function BenchmarkView({}) {
  const [ready, setReady] = useState<boolean>(false);
  const [complexProof, setComplexProof] = useState<string | null>(null);
  const [publicInputs, setPublicInputs] = useState<string | null>(null);
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

  // useEffect(() => {
  //   let temp: string[] = [];
  //   if (ready) {
  //     for (let i = 0; i < 10; i++) {
  //       let chunkPath = `${zkeyChunksFolderPath}/circuit_final_${i}.zkey`;
  //       RNFS.exists(chunkPath).then((resp) => {
  //         console.log(chunkPath);
  //         console.log(resp);
  //       });
  //       temp.push(chunkPath);
  //     }
  //     console.log('Chunked paths: ', temp);
  //     setChunkPaths(temp);
  //   }
  // }, [ready]);

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
      const { proof, pub_signals } = await groth16ProveWithZKeyFilePath(
        zkeyFilePath,
        DatFilePath,
        anonAadhaarArgs
      );
      setExecutionTime((prev) => ({ ...prev, proof: Date.now() - startProof }));
      setComplexProof(proof);
      console.log('Complex Proof received: ', proof);
      setPublicInputs(pub_signals);
      console.log('Public Inputs received: ', pub_signals);
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

  const verifProof = async (_proof: string, _publicInputs: string) => {
    try {
      const startVerif = Date.now();
      const res = await groth16Verify(
        _proof,
        _publicInputs,
        await getVerificationKey()
      );
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
        onPress={() =>
          complexProof && publicInputs
            ? verifProof(complexProof, publicInputs)
            : null
        }
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
