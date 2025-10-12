import { Token } from "@freshgum/typedi";

import { AuthProvider } from "./components/auth/providers/AuthProvider";

export const AuthProviderToken = new Token<AuthProvider>();
