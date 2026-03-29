"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import ErrorBoundary from "./ErrorBoundary";
import TenantThemeProvider from "./TenantThemeProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <TenantThemeProvider>
        <ErrorBoundary>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </ErrorBoundary>
      </TenantThemeProvider>
    </SessionProvider>
  );
}
