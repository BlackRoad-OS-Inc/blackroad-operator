import { ClerkProvider } from "@clerk/nextjs";
import type { ReactNode } from "react";

export type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => (
  <ClerkProvider>{children}</ClerkProvider>
);
