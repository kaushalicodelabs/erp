import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/lib/providers/query-provider";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ERP Engine | Modern Enterprise Management",
  description: "A premium enterprise management system for high-performance software companies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased bg-[#f5f6fa] text-gray-900`}
      >
        <QueryProvider>
          {children}
          <Toaster 
            position="bottom-right" 
            theme="light" 
            richColors 
            closeButton
            toastOptions={{
              style: {
                borderRadius: '12px',
                border: '1px solid #e4e4e7',
                background: '#ffffff',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              },
            }}
          />
        </QueryProvider>
      </body>
    </html>
  );
}
