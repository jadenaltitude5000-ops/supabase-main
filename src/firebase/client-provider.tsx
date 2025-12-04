
'use client';

import React, { type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';

/**
 * @deprecated This component is no longer needed. Please use `<FirebaseProvider>` directly.
 * The new `<FirebaseProvider>` handles singleton initialization internally.
 */
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  // The functionality of this component has been merged into FirebaseProvider.
  // We now render FirebaseProvider directly to simplify the component tree.
  return <FirebaseProvider>{children}</FirebaseProvider>;
}
