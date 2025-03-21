'use client';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { NavBar } from '@/components/NavBar';
import React from 'react';
import { store, persistor } from '../services/store';
import { Provider, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { AuthCard } from './Auth/components/AuthCard';

const inter = Inter({ subsets: ['latin'] });

function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const token = useSelector((state: any) => state.auth?.token);
  return (
    <div className={inter.className}>
      {token ? <NavBar /> : null}
      {token ? children : <AuthCard />}
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <LayoutWrapper>{children}</LayoutWrapper>
          </PersistGate>
        </Provider>
      </body>
    </html>
  );
}
