import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import { login as loginRequest } from '../lib/workerPortalApi';
import {
  getStoredSession,
  getStoredToken,
  setStoredSession,
  setStoredToken,
} from '../lib/tokenStorage';
import type { AuthenticatedUser } from '../types/worker-portal';

interface StoredSession {
  user: AuthenticatedUser;
  workerId: string | null;
}

interface AuthContextValue {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: AuthenticatedUser | null;
  workerId: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<StoredSession | null>(null);

  useEffect(() => {
    (async () => {
      const [token, storedSession] = await Promise.all([
        getStoredToken(),
        getStoredSession<StoredSession>(),
      ]);

      if (token && storedSession) {
        setSession(storedSession);
      }

      setIsLoading(false);
    })();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isLoading,
      isAuthenticated: session !== null,
      user: session?.user ?? null,
      workerId: session?.workerId ?? null,
      login: async (email: string, password: string) => {
        const response = await loginRequest(email, password);

        if (response.user.role !== 'WORKER') {
          throw new Error(
            'Tài khoản này không phải tài khoản người lao động',
          );
        }

        const nextSession: StoredSession = {
          user: response.user,
          workerId: response.profileId,
        };

        await setStoredToken(response.accessToken);
        await setStoredSession(nextSession);
        setSession(nextSession);
      },
      logout: async () => {
        await setStoredToken(null);
        await setStoredSession(null);
        setSession(null);
      },
    }),
    [isLoading, session],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth phải dùng bên trong AuthProvider');
  }

  return context;
}
