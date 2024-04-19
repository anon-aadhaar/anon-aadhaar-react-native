import { createContext, useContext } from 'react';
import type { AnonAadhaarProof } from '../types';

/**
 * `useAnonAadhaar` is a custom React hook that provides convenient access to the Anon Aadhaar authentication state
 * and a function to initiate the login process. This hook is designed to be used within components that are
 * nested inside `AnonAadhaarProvider`.
 *
 * @returns { [AnonAadhaarState, (request: AnonAadhaarRequest) => void] }
 * An array containing:
 *   - `AnonAadhaarState`: The current state of the Anon Aadhaar authentication process. This includes any relevant
 *     data about the current authentication status, user information, or error states.
 *   - `startReq`: A function that initiates the login/logout process. This function takes an `AnonAadhaarRequest` object
 *     as its argument, which includes the necessary information to start the authentication process.
 */
export function useAnonAadhaar(): [
  AnonAadhaarState,
  (state: ProofState) => void,
] {
  const val = useContext(AnonAadhaarContext);

  return [val.state, val.setProofState];
}

export interface AnonAadhaarContextVal {
  state: AnonAadhaarState;
  useTestAadhaar: boolean;
  appName: string;
  setProofState: (state: ProofState) => void;
}

export type ProofState = 'created' | 'deleted' | null;

export type AnonAadhaarState = {
  /** Whether the user is logged in. @see ProveButton */
  status: 'logged-out' | 'logged-in' | 'logging-in';
} & (
  | {
      status: 'logged-out';
    }
  | {
      status: 'logged-in';
      anonAadhaarProof: AnonAadhaarProof;
      // anonAadhaarProofs: {
      //   [key: number]: AnonAadhaarProof;
      // };
    }
);

export const AnonAadhaarContext = createContext<AnonAadhaarContextVal>({
  state: { status: 'logged-out' },
  useTestAadhaar: true,
  appName: '',
  setProofState: () => {
    // setProofState
  },
});
