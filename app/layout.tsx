import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Central de Pautas de Oração",
  description: "Coleta pública, revisão interna e composição dos 40 dias.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
