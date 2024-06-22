import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './Popup';
import { NextUIProvider } from '@nextui-org/react';
import './App.css';

const root = ReactDOM.createRoot(document.getElementById('root-b61cd16c-3eff-812a-e4f1-1e4bad67eb54'));
root.render(
  <React.StrictMode>
    <NextUIProvider >
    <main className="dark text-foreground bg-background">
        <App />
      </main>
    </NextUIProvider>
  </React.StrictMode>,
);
