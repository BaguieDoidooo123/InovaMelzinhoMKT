import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Assistente de Marketing AI",
  description: "Planejador de conteúdo com IA para redes sociais"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
