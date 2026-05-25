"use client";

import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import { ThirdwebProvider } from "thirdweb/react";

import { AuthProvider } from "@/components/providers/auth-provider";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <ThirdwebProvider>
        <AuthProvider>{children}</AuthProvider>
      </ThirdwebProvider>
    </ThemeProvider>
  );
}
