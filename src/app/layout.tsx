'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import React from 'react';
import { store, persistor } from '../services/store';
import { Provider, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import '../services/i18n';
import { AuthCard } from './auth/components/AuthCard';
import { Sidebar } from '@/components/sidebar/sidebar';
import {
  SidebarProvider,
  useSidebar,
} from '@/components/sidebar/sidebar-context';

const inter = Inter({ subsets: ['latin'] });

function MainContent({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebar();

  return (
    <main
      className={`flex-1 transition-all duration-300 ${
        isOpen ? 'pl-64' : 'pl-16'
      }`}
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
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <MainContent>{children}</MainContent>
      </div>
    </SidebarProvider>
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
