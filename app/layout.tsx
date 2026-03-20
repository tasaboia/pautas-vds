import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pautas de Oração",
  description: "Cadastro público de pautas e painel de organização.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
