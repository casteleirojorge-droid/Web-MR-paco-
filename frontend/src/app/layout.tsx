import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// Aquí definimos el título que saldrá en la pestaña del navegador
export const metadata: Metadata = {
  title: "Mr. Paco | Sistema de Gestión",
  description: "TPV y Control de Inventario para el local",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  );
}