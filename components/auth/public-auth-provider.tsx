'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { LoginModal } from './login-modal';

interface PublicAuthContextValue {
  openLogin: () => void;
  navigateToProtected: (href: string) => void;
}

const PublicAuthContext = createContext<PublicAuthContextValue | null>(null);

export function PublicAuthProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const router = useRouter();
  const session = useSession();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const navigateToProtected = (href: string): void => {
    if (session.isPending) {
      return;
    }

    if (session.data?.user) {
      router.push(href);
      return;
    }

    setIsLoginOpen(true);
  };

  return (
    <PublicAuthContext.Provider
      value={{
        openLogin: () => setIsLoginOpen(true),
        navigateToProtected,
      }}
    >
      {children}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </PublicAuthContext.Provider>
  );
}

export function usePublicAuth(): PublicAuthContextValue | null {
  return useContext(PublicAuthContext);
}
