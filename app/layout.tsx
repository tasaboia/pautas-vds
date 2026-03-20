<<<<<<< HEAD
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Central de Pautas de Oração",
  description: "Coleta pública, revisão interna e composição dos 40 dias.",
=======
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pautas de Oração",
  description: "Cadastro público de pautas e painel de organização.",
>>>>>>> 2ea456331d0280f0f4436421684651d159c2ff2a
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
