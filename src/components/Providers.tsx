"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import ErrorBoundary from "./ErrorBoundary";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ErrorBoundary>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </ErrorBoundary>
    </SessionProvider>
  );
}
