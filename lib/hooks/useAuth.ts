'use client';

import { useEffect, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession as useBetterAuthSession } from '@/lib/auth-client';
import { Role } from '@/lib/api/contract';

interface SessionUser {
  role?: Role;
}

interface SessionData {
  user?: SessionUser;
}

function readRole(sessionData: SessionData | null | undefined): Role | null {
  const role = sessionData?.user?.role;

  if (role === Role.ADMIN || role === Role.CONTENT_MANAGER || role === Role.USER) {
    return role;
  }

  return null;
}

export function useSession() {
  return useBetterAuthSession();
}

export function useRequireAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const session = useSession();

  useEffect(() => {
    if (session.isPending) {
      return;
    }

    if (!session.data) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [pathname, router, session.data, session.isPending]);

  return session;
}

export function useRequireRole(role: Role) {
  const router = useRouter();
  const session = useRequireAuth();

  const hasRole = useMemo(() => {
    const currentRole = readRole(session.data as SessionData | null | undefined);

    if (!currentRole) {
      return false;
    }

    if (currentRole === Role.ADMIN) {
      return true;
    }

    return currentRole === role;
  }, [role, session.data]);

  useEffect(() => {
    if (session.isPending || !session.data) {
      return;
    }

    if (!hasRole) {
      router.replace('/403');
    }
  }, [hasRole, router, session.data, session.isPending]);

  return {
    ...session,
    hasRole,
  };
}

export function useIsAdmin(): boolean {
  const session = useSession();
  const role = readRole(session.data as SessionData | null | undefined);
  return role === Role.ADMIN;
}

export function useIsContentManager(): boolean {
  const session = useSession();
  const role = readRole(session.data as SessionData | null | undefined);
  return role === Role.CONTENT_MANAGER || role === Role.ADMIN;
}
