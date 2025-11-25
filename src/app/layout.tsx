"use client"; // 👈 1. Convertir a Client Component

import { useState, useEffect } from "react"; // 👈 2. Importar hooks
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Header from "./components/Header/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 3. Estado para rastrear la conexión
  const [isOnline, setIsOnline] = useState(true);

  // 4. Efecto para escuchar eventos de conexión
  useEffect(() => {
    // Función para actualizar el estado
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Asignar estado inicial al cargar
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);
    }

    // Agregar event listeners
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Limpiar listeners al desmontar el componente
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []); // El array vacío asegura que esto solo se ejecute al montar/desmontar

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        {/* 5. Banner de "Sin Conexión" */}
        {!isOnline && (
          <div className="fixed top-0 left-0 w-full bg-red-600 text-white text-center p-2 z-50 shadow-lg animate-pulse">
            <p className="font-semibold">
              Estás sin conexión
            </p>
            <p className="text-sm">
              Comprueba tu conexión a internet.
            </p>
          </div>
        )}

         {/* Header fijo (desktop + móvil) + footer móvil */}
        <Header />

        {/* Contenido de la página */}
        <main
          className="
            pt-16 sm:pt-20    /* espacio para el header fijo */
            pb-16 sm:pb-0     /* espacio para el footer móvil en pantallas pequeñas */
          "
        >
          {children}
        </main>
      </body>
    </html>
  );
}
