import {
  AnonAadhaarContext,
  type AnonAadhaarState,
} from '../hooks/useAnonAadhaar';
import React, { useEffect, useState, type ReactNode } from 'react';
import type { AnonAadhaarProof } from '../types';
import storage from '../storage';

type ArtifactsLinks = {
  zkey_url: string;
  wasm_url: string;
  vkey_url: string;
};

// Props for the AnonAadhaarProvider
export type AnonAadhaarProviderProps = {
  /**
   * `children`: The ReactNode elements that form the child components of your application.
   * This is a standard prop for components that wrap around other components to provide context or styling.
   */
  children: ReactNode;

  /**
   * `_useTestAadhaar`: Flag to determine the usage of test Aadhaar data.
   * Set this to `true` if you want to use test Aadhaar data instead of real data for development or testing purposes.
   * Defaults to `false` if not explicitly set.
   */
  _useTestAadhaar?: boolean;

  /**
   * `_artifactslinks`: Here you can specify your own artifacts.
   * It can be either file located in your public directory by specifying the root (e.g. "./circuit_final.zkey")
   * or the url of artifacts that you stored on your own server.
   */
  _artifactslinks?: ArtifactsLinks;

  /**
   * `_appName`: Name of your app
   */
  _appName?: string;
};

/**
 * AnonAadhaarProvider is a React component that serves as a provider for the
 * AnonAadhaarContext. It manages the authentication state, login requests,
 * and communication with the proving component. This provider initializes the
 * authentication state from local storage on page load and handles updates to
 * the state when login requests are made and when new proofs are received.
 *
 * @param {AnonAadhaarProviderProps}  anonAadhaarProviderProps
 *
 * @returns A JSX element that wraps the provided child components with the
 * AnonAadhaarContext.Provider.
 */
export function AnonAadhaarProvider(
  anonAadhaarProviderProps: AnonAadhaarProviderProps
) {
  // Read state from local storage on page load
  const [useTestAadhaar, setUseTestAadhaar] = useState<boolean>(false);
  const [proofState, setProofState] = useState<'created' | 'deleted' | null>(
    null
  );
  const [appName, setAppName] = useState<string>('The current application');
  const [state, setState] = useState<AnonAadhaarState>({
    status: 'logged-out',
  });

  useEffect(() => {
    if (anonAadhaarProviderProps._useTestAadhaar !== undefined)
      setUseTestAadhaar(anonAadhaarProviderProps._useTestAadhaar);
  }, [anonAadhaarProviderProps._useTestAadhaar]);

  useEffect(() => {
    if (anonAadhaarProviderProps._appName !== undefined)
      setAppName(anonAadhaarProviderProps._appName);
  }, [anonAadhaarProviderProps._appName]);

  // Receive Proof from local storage
  React.useEffect(() => {
    if (proofState === 'deleted') {
      setState({ status: 'logged-out' });
    } else {
      getAnonAadhaarProof().then((proof: AnonAadhaarProof) => {
        if (!proof) return;
        setState({ status: 'logged-in', anonAadhaarProof: proof });
      });
    }
  }, [proofState]);

  // Provide context
  const val = React.useMemo(
    () => ({ state, useTestAadhaar, appName, setProofState }),
    [state, useTestAadhaar, appName, setProofState]
  );

  return (
    <AnonAadhaarContext.Provider value={val}>
      {anonAadhaarProviderProps.children}
    </AnonAadhaarContext.Provider>
  );
}

export async function getAnonAadhaarProof() {
  return await storage
    .load({
      key: 'anonAadhaar',
      syncInBackground: true,
    })
    .then((ret) => {
      // found data go to then()
      return ret;
    })
    .catch((err) => {
      // any exception including data not found
      // goes to catch()
      //   console.warn(err.message);
      switch (err.name) {
        case 'NotFoundError':
          // TODO;
          break;
        case 'ExpiredError':
          // TODO
          break;
      }
    });
}

export function serialize(state: AnonAadhaarState): string {
  const { status } = state;
  let serState;
  if (status === 'logged-out') {
    serState = {
      status: 'logged-out',
    };
  } else {
    serState = {
      status,
      anonAadhaarProof: state.anonAadhaarProof,
    };
  }
  return JSON.stringify(serState);
}
