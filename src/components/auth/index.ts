import { LogHelper } from "@root/utils";
import { injectable } from "tsyringe";

import { ConfigManager } from "../config";
import { LangManager } from "../langs";
import {
    AuthProvider,
    AuthProviderConstructor,
} from "./providers/AuthProvider";

@injectable()
export class AuthManager {
    private static authProviders: Map<string, AuthProviderConstructor> =
        new Map();

    public static registerProviders(
        providers: Record<string, AuthProviderConstructor>
    ): void {
        Object.entries(providers).forEach(([providerName, provider]) => {
            this.authProviders.set(providerName, provider); 
        });
    }

    static getProvider(
        configManager: ConfigManager,
        langManager: LangManager
    ): AuthProvider {
        const providerType = configManager.config.auth.type;

        if (!AuthManager.authProviders.has(providerType)) {
            LogHelper.fatal(
                langManager.getTranslate.AuthManager.invalidProvider
            );
        }

        const Provider = AuthManager.authProviders.get(providerType);
        return new Provider(configManager.config);
    }
}
