'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import React, { useContext } from 'react';
import { store, persistor } from '../services/store';
import { Provider, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import '../services/i18n';
import { AuthCard } from './auth/components/AuthCard';
import { Sidebar, SidebarContext } from '@/components/sidebar/sidebar';

const inter = Inter({ subsets: ['latin'] });

function MainContent({ children }: { children: React.ReactNode }) {
  const { isOpen } = useContext(SidebarContext);

  return (
    <main
      className={`transition-all duration-300 ${isOpen ? 'ml-64' : 'ml-16'}`}
    >
      {children}
    </main>
  );
}

function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const token = useSelector((state: any) => state.auth?.token);

  if (!token) {
    return <AuthCard />;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <MainContent>{children}</MainContent>
      </div>
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className={inter.className}>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <LayoutWrapper>{children}</LayoutWrapper>
          </PersistGate>
        </Provider>
      </body>
    </html>
  );
}
