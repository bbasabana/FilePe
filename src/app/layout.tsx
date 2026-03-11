import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FilePe — Gestion des dossiers",
  description: "Gestion des détenus — Prison de Makala, Kinshasa",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-surface text-ink-primary font-sans`}
        suppressHydrationWarning
      >
        {children}
        <Toaster
          theme="light"
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            style: {
              background: "rgba(255, 255, 255, 0.96)",
              border: "1px solid rgba(15, 23, 42, 0.06)",
              color: "#0f172a",
            },
            classNames: {
              toast: "font-sans text-[14px]",
              title: "font-medium",
              description: "text-slate-500 text-[13px]",
              success: "border-l-4 border-l-emerald-500",
              error: "border-l-4 border-l-red-500",
            },
          }}
        />
      </body>
    </html>
  );
}
