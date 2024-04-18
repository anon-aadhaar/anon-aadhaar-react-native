import { createContext, useContext, useEffect, useState } from 'react';
import type { AnonAadhaarArgs, AnonAadhaarProof } from '../types';
import storage from '../storage';

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
export function useAnonAadhaar(): [AnonAadhaarState, any] {
  const [proofs, setProofs] = useState<any>(null);
  const val = useContext(AnonAadhaarContext);

  useEffect(() => {
    getAnonAadhaarProof()
      .then((data) => setProofs(data))
      .catch((e) => console.log(e));
  });

  return [val.state, proofs];
}

export interface AnonAadhaarContextVal {
  state: AnonAadhaarState;
  useTestAadhaar: boolean;
  appName: string;
}

export type AnonAadhaarRequest =
  | { type: 'login'; args: AnonAadhaarArgs }
  | { type: 'logout' };

export type AnonAadhaarState = {
  /** Whether the user is logged in. @see ProveButton */
  status: 'logged-out' | 'logged-in' | 'logging-in';
} & (
  | {
      status: 'logged-out';
    }
  // | {
  //     status: 'logging-in';
  //     anonAadhaarProofs?: {
  //       [key: number]: AnonAadhaarProof;
  //     };
  //   }
  | {
      status: 'logged-in';
      anonAadhaarProofs: {
        [key: number]: AnonAadhaarProof;
      };
    }
);

export const AnonAadhaarContext = createContext<AnonAadhaarContextVal>({
  state: { status: 'logged-out' },
  useTestAadhaar: true,
  appName: '',
});

export async function getAnonAadhaarProof() {
  return await storage
    .load({
      key: 'loginState',

      // autoSync (default: true) means if data is not found or has expired,
      // then invoke the corresponding sync method
      // autoSync: true,

      // syncInBackground (default: true) means if data expired,
      // return the outdated data first while invoking the sync method.
      // If syncInBackground is set to false, and there is expired data,
      // it will wait for the new data and return only after the sync completed.
      // (This, of course, is slower)
      syncInBackground: true,

      // you can pass extra params to the sync method
      // see sync example below
      // syncParams: {
      //   extraFetchOptions: {
      //     // blahblah
      //   },
      //   someFlag: true,
      // },
    })
    .then((ret) => {
      // found data go to then()
      console.log('Returned object from storage: ', ret);
      return ret;
    })
    .catch((err) => {
      // any exception including data not found
      // goes to catch()
      console.warn(err.message);
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
