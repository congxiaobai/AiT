import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './Setting';
import { NextUIProvider } from '@nextui-org/react';
import './index.css'
import { ToastProvider } from 'tw-noti';

const root = ReactDOM.createRoot(document.getElementById('root-b61cd16c-3eff-812a-e4f1-1e4bad67eb54'));
root.render(
  <React.StrictMode>
    <NextUIProvider >
      <ToastProvider
        maxToasts={1}
        timeout={2000}
        containerClasses='right-12 top-12 h-6'
      >
        <main className="dark text-foreground bg-background">
          <App />
        </main>
      </ToastProvider>
    </NextUIProvider>
  </React.StrictMode>,
);
