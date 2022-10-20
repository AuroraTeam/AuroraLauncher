import { AbstractAuthProvider, LogHelper } from "@root/utils"

import { ConfigManager } from "../config"
import { LangManager } from "../langs"
import { AcceptAuthProvider } from "./authProviders/AcceptAuthProvider"
import { MojangAuthProvider } from "./authProviders/MojangAuthProvider"
// import { MySQLAuthProvider } from "./authProviders/MySQLAuthProvider"
import { RejectAuthProvider } from "./authProviders/RejectAuthProvider"

// TODO Ох уж эти приколы с типами
// Другие решения получались не красивыми
// Если есть идеи как сделать лучше - пишите))
type AnyAuthProvider =
    | typeof AcceptAuthProvider
    | typeof RejectAuthProvider
    | typeof MojangAuthProvider
//  | typeof MySQLAuthProvider

export class AuthManager {
    private readonly authProvider: AbstractAuthProvider
    private readonly authProviders: Map<string, AnyAuthProvider> = new Map()

    constructor(configManager: ConfigManager, langManager: LangManager) {
        this.registerAuthProviders()

        const providerType = configManager.config.auth.type

        if (!this.authProviders.has(providerType))
            LogHelper.fatal(
                langManager.getTranslate.AuthManager.invalidProvider
            )
        this.authProvider = new (this.authProviders.get(providerType))(
            configManager
        )
    }

    private registerAuthProviders(): void {
        this.registerProvider(AcceptAuthProvider)
        this.registerProvider(RejectAuthProvider)
        this.registerProvider(MojangAuthProvider)
        // this.registerProvider(MySQLAuthProvider)
    }

    private registerProvider(provider: AnyAuthProvider): void {
        this.authProviders.set(provider.getType(), provider)
    }

    getAuthProvider(): AbstractAuthProvider {
        return this.authProvider
    }
}
