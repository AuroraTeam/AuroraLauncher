import { Token } from "@freshgum/typedi";

import { AuthProvider } from "./components/auth/providers/AuthProvider";

export const AuthProviderToken = new Token<AuthProvider>();
export const ShutdownToken = new Token<() => Promise<void>>();
