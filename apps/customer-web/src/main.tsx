import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

import { App } from './app/App';
import { CustomerSessionProvider } from './session/CustomerSession';
import './styles/global.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 20_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(
  document.getElementById('root')!,
).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <CustomerSessionProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </CustomerSessionProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
