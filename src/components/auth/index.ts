import { AbstractAuthProvider, LogHelper } from "@root/utils"

import { ConfigManager } from "../config"
import { LangManager } from "../langs"
import { AcceptAuthProvider } from "./authProviders/AcceptAuthProvider"
import { DatabaseAuthProvider } from "./authProviders/DatabaseAuthProvider"
import { JsonAuthProvider } from "./authProviders/JsonAuthProvider"
import { MojangAuthProvider } from "./authProviders/MojangAuthProvider"
import { RejectAuthProvider } from "./authProviders/RejectAuthProvider"

export class AuthManager {
    private readonly authProvider: AbstractAuthProvider
    private readonly authProviders: Map<string, typeof AbstractAuthProvider> =
        new Map()

    constructor(configManager: ConfigManager, langManager: LangManager) {
        this.registerAuthProviders()

        const providerType = configManager.config.auth.type

        if (!this.authProviders.has(providerType))
            LogHelper.fatal(
                langManager.getTranslate.AuthManager.invalidProvider
            )

        // Да, вертел я типизацию
        const Provider = <typeof AcceptAuthProvider>(
            this.authProviders.get(providerType)
        )
        this.authProvider = new Provider(configManager)
    }

    private registerAuthProviders(): void {
        this.registerProvider(AcceptAuthProvider)
        this.registerProvider(RejectAuthProvider)
        this.registerProvider(MojangAuthProvider)
        this.registerProvider(DatabaseAuthProvider)
        this.registerProvider(JsonAuthProvider)
    }

    private registerProvider(provider: typeof AbstractAuthProvider): void {
        this.authProviders.set(provider.getType(), provider)
    }

    getAuthProvider(): AbstractAuthProvider {
        return this.authProvider
    }
}
