"use client";
import { QueryProvider } from "./query-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface ProviderProps {
  children: React.ReactNode;
}

export const Providers = ({ children }: ProviderProps) => {
  return <QueryProvider>{children}</QueryProvider>;
};
