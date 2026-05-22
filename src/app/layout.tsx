import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BI Platform — ЛР10",
  description: "Визуализация данных PostgreSQL + NL→SQL",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body className="antialiased">{children}</body>
    </html>
  );
}
