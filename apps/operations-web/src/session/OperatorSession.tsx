import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  apiRequest,
  getAccessToken,
  registerUnauthorizedHandler,
  setAccessToken,
} from '../lib/api';

const STORAGE_KEYS = {
  userId: 'worklink.ops.userId',
  fullName: 'worklink.ops.fullName',
  email: 'worklink.ops.email',
  role: 'worklink.ops.role',
};

interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
  };
}

type OperatorSessionValue = {
  userId: string;
  fullName: string;
  email: string;
  role: string;
  configured: boolean;
  login(email: string, password: string): Promise<void>;
  logout(): void;
};

const OperatorSessionContext =
  createContext<OperatorSessionValue | null>(null);

export function OperatorSessionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [userId, setUserId] = useState(
    localStorage.getItem(STORAGE_KEYS.userId) ?? '',
  );
  const [fullName, setFullName] = useState(
    localStorage.getItem(STORAGE_KEYS.fullName) ?? '',
  );
  const [email, setEmail] = useState(
    localStorage.getItem(STORAGE_KEYS.email) ?? '',
  );
  const [role, setRole] = useState(
    localStorage.getItem(STORAGE_KEYS.role) ?? '',
  );

  const clear = () => {
    setAccessToken(null);
    Object.values(STORAGE_KEYS).forEach((key) =>
      localStorage.removeItem(key),
    );
    setUserId('');
    setFullName('');
    setEmail('');
    setRole('');
  };

  useEffect(() => {
    registerUnauthorizedHandler(clear);
  }, []);

  const value = useMemo<OperatorSessionValue>(
    () => ({
      userId,
      fullName,
      email,
      role,
      configured: Boolean(getAccessToken() && userId),
      async login(loginEmail, password) {
        const response = await apiRequest<AuthResponse>(
          '/auth/login',
          {
            method: 'POST',
            body: JSON.stringify({
              email: loginEmail,
              password,
            }),
          },
        );

        setAccessToken(response.accessToken);
        localStorage.setItem(
          STORAGE_KEYS.userId,
          response.user.id,
        );
        localStorage.setItem(
          STORAGE_KEYS.fullName,
          response.user.fullName,
        );
        localStorage.setItem(
          STORAGE_KEYS.email,
          response.user.email,
        );
        localStorage.setItem(
          STORAGE_KEYS.role,
          response.user.role,
        );

        setUserId(response.user.id);
        setFullName(response.user.fullName);
        setEmail(response.user.email);
        setRole(response.user.role);
      },
      logout: clear,
    }),
    [userId, fullName, email, role],
  );

  return (
    <OperatorSessionContext.Provider value={value}>
      {children}
    </OperatorSessionContext.Provider>
  );
}

export function useOperatorSession() {
  const context = useContext(OperatorSessionContext);

  if (!context) {
    throw new Error(
      'useOperatorSession must be inside provider',
    );
  }

  return context;
}
