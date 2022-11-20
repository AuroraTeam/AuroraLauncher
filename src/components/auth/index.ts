import {
    AbstractAuthProvider,
    AbstractAuthProviderConstructor,
    LogHelper,
} from "@root/utils"
import { injectable, singleton } from "tsyringe"

import { ConfigManager } from "../config"
import { LangManager } from "../langs"
import { AcceptAuthProvider } from "./authProviders/AcceptAuthProvider"
import { DatabaseAuthProvider } from "./authProviders/DatabaseAuthProvider"
import { JsonAuthProvider } from "./authProviders/JsonAuthProvider"
import { MojangAuthProvider } from "./authProviders/MojangAuthProvider"
import { RejectAuthProvider } from "./authProviders/RejectAuthProvider"

@singleton()
@injectable()
export class AuthManager {
    private readonly authProvider: AbstractAuthProvider
    private readonly authProviders: Map<
        string,
        AbstractAuthProviderConstructor
    > = new Map()

    constructor(configManager: ConfigManager, langManager: LangManager) {
        this.registerAuthProviders()

        const providerType = configManager.config.auth.type

        if (!this.authProviders.has(providerType)) {
            LogHelper.fatal(
                langManager.getTranslate.AuthManager.invalidProvider
            )
        }

        const Provider = this.authProviders.get(providerType)
        this.authProvider = new Provider(configManager.config)
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
        provider: AbstractAuthProviderConstructor
    ): void {
        this.authProviders.set(type, provider)
    }

    getAuthProvider(): AbstractAuthProvider {
        return this.authProvider
    }
}
