import { LogHelper } from "@root/utils"
import { injectable } from "tsyringe"

import { ConfigManager } from "../config"
import { LangManager } from "../langs"
import { AuthProviderConstructor } from "./providers/AuthProvider"

@injectable()
export class AuthManager {
    private static authProviders: Map<string, AuthProviderConstructor> =
        new Map()

    public static registerProvider(
        type: string,
        provider: AuthProviderConstructor
    ) {
        this.authProviders.set(type, provider)
    }

    static getProvider(configManager: ConfigManager, langManager: LangManager) {
        const providerType = configManager.config.auth.type

        if (!AuthManager.authProviders.has(providerType)) {
            LogHelper.fatal(
                langManager.getTranslate.AuthManager.invalidProvider
            )
        }

        const Provider = AuthManager.authProviders.get(providerType)
        return new Provider(configManager.config)
    }
}
