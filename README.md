# Anon Aadhaar React Native

A React Native library that allows mobile applications to generate and verify zero knowledge proofs from the Aadhaar QR code. 

## Features

- Scan Aadhaar secure QR codes and verify the UIDAI signature
- Generate Groth16 proofs for the selected identity fields
- Provide a context provider for easy integration in React Native apps
- Includes a modal component to guide the user through the proof generation flow

## Installation

```sh
# Yarn
yarn add @anon-aadhaar/react-native
# or npm
npm install @anon-aadhaar/react-native
```

The repository is a monorepo managed with Yarn workspaces. Run `yarn` in the root directory to install all dependencies including the example application.

## Usage

1. **Setup the prover** – download the proving artifacts once when your app starts:

```ts
import { setupProver } from '@anon-aadhaar/react-native';

useEffect(() => {
  setupProver();
}, []);
```

2. **Wrap your application** with `AnonAadhaarProvider` so that child components can access the proof state:

```tsx
import { AnonAadhaarProvider } from '@anon-aadhaar/react-native';

export default function App() {
  return (
    <AnonAadhaarProvider>
      {/* your navigation / screens */}
    </AnonAadhaarProvider>
  );
}
```

3. **Trigger the proof creation** using the `AnonAadhaarProve` component. It opens a modal that guides the user to scan the QR code and generates the proof.

```tsx
import { AnonAadhaarProve } from '@anon-aadhaar/react-native';

<AnonAadhaarProve buttonMessage="Create Proof" nullifierSeed={1234} />;
```

Check the [`example/`](example) folder for a complete Expo application demonstrating these steps.

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

[MIT](LICENSE)


