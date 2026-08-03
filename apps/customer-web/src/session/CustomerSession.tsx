import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  getAccessToken,
  registerUnauthorizedHandler,
  setAccessToken,
} from '../lib/api';
import {
  authApi,
  type RegisterInput,
} from '../services/auth';

const STORAGE_KEYS = {
  customerId: 'worklink.customerId',
  userId: 'worklink.userId',
  fullName: 'worklink.fullName',
  email: 'worklink.email',
};

type CustomerSessionValue = {
  customerId: string;
  userId: string;
  fullName: string;
  email: string;
  configured: boolean;
  login(email: string, password: string): Promise<void>;
  register(input: RegisterInput): Promise<void>;
  logout(): void;
};

const CustomerSessionContext =
  createContext<CustomerSessionValue | null>(null);

export function CustomerSessionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [customerId, setCustomerId] = useState(
    localStorage.getItem(STORAGE_KEYS.customerId) ?? '',
  );
  const [userId, setUserId] = useState(
    localStorage.getItem(STORAGE_KEYS.userId) ?? '',
  );
  const [fullName, setFullName] = useState(
    localStorage.getItem(STORAGE_KEYS.fullName) ?? '',
  );
  const [email, setEmail] = useState(
    localStorage.getItem(STORAGE_KEYS.email) ?? '',
  );

  const clear = () => {
    setAccessToken(null);
    Object.values(STORAGE_KEYS).forEach((key) =>
      localStorage.removeItem(key),
    );
    setCustomerId('');
    setUserId('');
    setFullName('');
    setEmail('');
  };

  useEffect(() => {
    registerUnauthorizedHandler(clear);
  }, []);

  const applySession = (response: {
    accessToken: string;
    profileId: string | null;
    user: {
      id: string;
      fullName: string;
      email: string;
    };
  }) => {
    if (!response.profileId) {
      throw new Error(
        'Tài khoản chưa có hồ sơ khách hàng',
      );
    }

    setAccessToken(response.accessToken);
    localStorage.setItem(
      STORAGE_KEYS.customerId,
      response.profileId,
    );
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

    setCustomerId(response.profileId);
    setUserId(response.user.id);
    setFullName(response.user.fullName);
    setEmail(response.user.email);
  };

  const value = useMemo<CustomerSessionValue>(
    () => ({
      customerId,
      userId,
      fullName,
      email,
      configured: Boolean(
        getAccessToken() && customerId,
      ),
      async login(loginEmail, password) {
        const response = await authApi.login(
          loginEmail,
          password,
        );
        applySession(response);
      },
      async register(input) {
        const response = await authApi.register(input);
        applySession(response);
      },
      logout: clear,
    }),
    [customerId, userId, fullName, email],
  );

  return (
    <CustomerSessionContext.Provider value={value}>
      {children}
    </CustomerSessionContext.Provider>
  );
}

export function useCustomerSession() {
  const context = useContext(CustomerSessionContext);

  if (!context) {
    throw new Error(
      'useCustomerSession must be inside provider',
    );
  }

  return context;
}
