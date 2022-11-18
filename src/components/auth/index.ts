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
        this.registerProvider("accept", AcceptAuthProvider)
        this.registerProvider("reject", RejectAuthProvider)
        this.registerProvider("mojang", MojangAuthProvider)
        this.registerProvider("db", DatabaseAuthProvider)
        this.registerProvider("json", JsonAuthProvider)
    }

    private registerProvider(
        type: string,
        provider: typeof AbstractAuthProvider
    ): void {
        this.authProviders.set(type, provider)
    }

    getAuthProvider(): AbstractAuthProvider {
        return this.authProvider
    }
}
