"use client"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Link from "next/link"
import { NavBar } from "@/components/NavBar"

import React from "react"
import { store, persistor } from "../services/store"
import { Provider } from "react-redux"
import { PersistGate } from "redux-persist/integration/react"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html>
      <body>
          <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
              <div className={inter.className}>
                <NavBar />
                {children}
              </div>
            </PersistGate>
          </Provider>
      </body>
    </html>
  )
}
