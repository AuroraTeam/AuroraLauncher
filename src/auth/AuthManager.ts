import { LogHelper } from "../helpers/LogHelper"
import { App } from "../LauncherServer"
import { AbstractAuthProvider } from "./AbstractAuthProvider"
import { AcceptAuthProvider } from "./authProviders/AcceptAuthProvider"
import { MojangAuthProvider } from "./authProviders/MojangAuthProvider"
import { RejectAuthProvider } from "./authProviders/RejectAuthProvider"

// TODO Ох уж эти приколы с типами
// Другие решения получалсь не красивыми
// Если есть идеи как сделать лучше - пишите))
type AnyAuthProvider = typeof AcceptAuthProvider | typeof RejectAuthProvider | typeof MojangAuthProvider //Думал над решением этой херни больше чем живу

export class AuthManager {
    private readonly authProvider: AbstractAuthProvider
    private authProviders: Map<string, AnyAuthProvider> = new Map()

    constructor() {
        this.registerAuthProviders()

        const providerType = App.ConfigManager.getConfig().auth.type

        if (!this.authProviders.has(providerType)) LogHelper.fatal(App.LangManager.getTranslate().AuthManager.invalidProvider)
        this.authProvider = new (this.authProviders.get(providerType))()
    }

    private registerAuthProviders(): void {
        this.registerProvider(AcceptAuthProvider)
        this.registerProvider(RejectAuthProvider)
        this.registerProvider(MojangAuthProvider)
    }

    private registerProvider(provider: AnyAuthProvider): void {
        this.authProviders.set(provider.getType(), provider)
    }

    getAuthProvider(): AbstractAuthProvider {
        return this.authProvider
    }
}
