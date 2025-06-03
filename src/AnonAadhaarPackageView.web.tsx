import * as React from 'react';

import { AnonAadhaarPackageViewProps } from './AnonAadhaarPackage.types';

export default function AnonAadhaarPackageView(props: AnonAadhaarPackageViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
