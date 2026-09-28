import type { Metadata } from "next";
import { Onest } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { PublicAuthProvider } from "@/components/auth/public-auth-provider";

export const metadata: Metadata = {
  title: "Нейрофото — Фото себя за секунды",
  description: "Создавайте фото в любых стилях с помощью ИИ",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

const onest = Onest({
  subsets: ["cyrillic", "latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-onest",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${onest.className} min-h-screen bg-background text-foreground antialiased flex flex-col`}
      >
        <QueryProvider>
          <PublicAuthProvider>
            <main className="flex-1">{children}</main>
          </PublicAuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
