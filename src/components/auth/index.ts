import { LogHelper } from "@root/utils"
import { injectable, singleton } from "tsyringe"

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

@singleton()
@injectable()
export class AuthManager {
    private readonly authProvider: AbstractAuthProvider
    private readonly authProviders: Map<
        string,
        AbstractAuthProviderConstructor
    > = new Map()

    constructor(
        private configManager: ConfigManager,
        private langManager: LangManager
    ) {
        this.registerAuthProviders()

        const providerType = configManager.config.auth.type
        this.authProvider = this.getProvider(providerType)
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

    /**
     * @deprecated
     */
    getAuthProvider(): AbstractAuthProvider {
        return this.authProvider
    }

    getProvider(providerType: string): AbstractAuthProvider {
        if (!this.authProviders.has(providerType)) {
            LogHelper.fatal(
                this.langManager.getTranslate.AuthManager.invalidProvider
            )
        }

        const Provider = this.authProviders.get(providerType)
        return new Provider(this.configManager.config)
    }
}
