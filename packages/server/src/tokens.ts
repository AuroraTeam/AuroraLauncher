import { Token } from "@freshgum/typedi";

import { AuthProvider } from "./components/auth";

export const AuthProviderToken = new Token<AuthProvider>();
