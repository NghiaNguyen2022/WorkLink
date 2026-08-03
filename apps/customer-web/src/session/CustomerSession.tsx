import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type CustomerSessionValue = {
  customerId: string;
  customerUserId: string;
  configured: boolean;
  setSession(
    customerId: string,
    customerUserId: string,
  ): void;
  clear(): void;
};

const CustomerSessionContext =
  createContext<CustomerSessionValue | null>(null);

export function CustomerSessionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [customerId, setCustomerId] = useState(
    localStorage.getItem('worklink.customerId') ?? '',
  );
  const [customerUserId, setCustomerUserId] =
    useState(
      localStorage.getItem(
        'worklink.customerUserId',
      ) ?? '',
    );

  const value = useMemo<CustomerSessionValue>(
    () => ({
      customerId,
      customerUserId,
      configured: Boolean(
        customerId && customerUserId,
      ),
      setSession(nextCustomerId, nextUserId) {
        localStorage.setItem(
          'worklink.customerId',
          nextCustomerId,
        );
        localStorage.setItem(
          'worklink.customerUserId',
          nextUserId,
        );
        setCustomerId(nextCustomerId);
        setCustomerUserId(nextUserId);
      },
      clear() {
        localStorage.removeItem('worklink.customerId');
        localStorage.removeItem(
          'worklink.customerUserId',
        );
        setCustomerId('');
        setCustomerUserId('');
      },
    }),
    [customerId, customerUserId],
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
