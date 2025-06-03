import { requireNativeView } from 'expo';
import * as React from 'react';

import { AnonAadhaarPackageViewProps } from './AnonAadhaarPackage.types';

const NativeView: React.ComponentType<AnonAadhaarPackageViewProps> =
  requireNativeView('AnonAadhaarPackage');

export default function AnonAadhaarPackageView(props: AnonAadhaarPackageViewProps) {
  return <NativeView {...props} />;
}
