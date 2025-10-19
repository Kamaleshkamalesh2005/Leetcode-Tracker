'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';

interface ProvidersProps {
  children: React.ReactNode;
}

export function SessionProvider({ children }: ProvidersProps) {
  return (
    <NextAuthSessionProvider>
      {children}
    </NextAuthSessionProvider>
  );
}