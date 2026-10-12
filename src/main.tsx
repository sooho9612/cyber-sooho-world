import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext';
import { MessageBoxProvider } from './context/MessageBoxProvider';
import { LocaleProvider } from './i18n/LocaleContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LocaleProvider>
      <MessageBoxProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MessageBoxProvider>
    </LocaleProvider>
  </StrictMode>
);
