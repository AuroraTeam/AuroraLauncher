import { LogHelper } from "@root/utils"
import { injectable } from "tsyringe"

import { ConfigManager } from "../config"
import { LangManager } from "../langs"
import {
    AbstractAuthProvider,
    AbstractAuthProviderConstructor,
} from "./authProviders/AbstractAuthProvider"
import { AcceptAuthProvider } from "./authProviders/AcceptAuthProvider"
import { DatabaseAuthProvider } from "./authProviders/DatabaseAuthProvider"
import { JsonAuthProvider } from "./authProviders/JsonAuthProvider"
import { MojangAuthProvider } from "./authProviders/MojangAuthProvider"
import { RejectAuthProvider } from "./authProviders/RejectAuthProvider"

@injectable()
export class AuthManager {
    /**
     * @deprecated
     */
    private readonly authProvider: AbstractAuthProvider
    private static readonly authProviders: Map<
        string,
        AbstractAuthProviderConstructor
    > = new Map()

    constructor(configManager: ConfigManager, langManager: LangManager) {
        this.authProvider = AuthManager.getProvider(configManager, langManager)
    }

    // Почему-то static блоки работают некорректно
    // TODO Чекнуть позже как можно решить проблемку
    // static {
    //     this.registerProviders()
    // }

    static registerProviders() {
        this.registerProvider("accept", AcceptAuthProvider)
        this.registerProvider("reject", RejectAuthProvider)
        this.registerProvider("mojang", MojangAuthProvider)
        this.registerProvider("db", DatabaseAuthProvider)
        this.registerProvider("json", JsonAuthProvider)
    }

    public static registerProvider(
        type: string,
        provider: AbstractAuthProviderConstructor
    ) {
        this.authProviders.set(type, provider)
    }

    /**
     * @deprecated
     */
    getAuthProvider(): AbstractAuthProvider {
        return this.authProvider
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
