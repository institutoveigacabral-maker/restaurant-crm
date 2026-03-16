import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import WebVitals from "@/components/WebVitals";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RestaurantCRM - Gestão de Clientes",
  description: "CRM para gestão de clientes de restaurante",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ea580c" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="RestaurantCRM" />
      </head>
      <body className={`${geistSans.variable} font-sans antialiased`}>
        <ServiceWorkerRegistration />
        <WebVitals />
        <Providers>{children}</Providers>
              <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
