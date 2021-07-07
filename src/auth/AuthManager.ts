import { LogHelper } from "../helpers/LogHelper"
import { App } from "../LauncherServer"
import { AbstractProvider } from "./AbstractProvider"
import { AbstractAuthProvider } from "./authProviders/AbstractAuthProvider"
import { AcceptAuthProvider } from "./authProviders/AcceptAuthProvider"
import { MojangAuthProvider } from "./authProviders/MojangAuthProvider"
import { RejectAuthProvider } from "./authProviders/RejectAuthProvider"
import { AbstractTextureProvider } from "./textureProviders/AbstractTextureProvider"
import { VoidTextureProvider } from "./textureProviders/VoidTextureProvider"

type ProviderMap<P> = Map<string, P>

// TODO
// Ох уж эти приколы с типами
// Другие решения получалсь не красивыми
// Если есть идеи как сделать лучше - пишите))
type AnyAuthProvider = typeof AcceptAuthProvider | typeof RejectAuthProvider | typeof MojangAuthProvider
type AnyTextureProvider = typeof VoidTextureProvider

export class AuthManager {
    private authProvider: AbstractAuthProvider
    private textureProvider: AbstractTextureProvider
    authProviders: ProviderMap<typeof AbstractAuthProvider> = new Map()
    textureProviders: ProviderMap<typeof AbstractTextureProvider> = new Map()

    constructor() {
        this.registerAuthProviders()
        this.registerTextureProviders()

        const config = App.ConfigManager.getConfig().auth

        this.authProvider = new (this.getProvider("authProvider", config.authProvider.type) as AnyAuthProvider)()
        this.textureProvider = new (this.getProvider(
            "textureProvider",
            config.textureProvider.type
        ) as AnyTextureProvider)()
    }

    getAuthProvider(): AbstractAuthProvider {
        return this.authProvider
    }

    getTextureProvider(): AbstractTextureProvider {
        return this.textureProvider
    }

    private getProvider(providerType: "authProvider" | "textureProvider", type: string): AbstractProvider {
        const providersMap = providerType === "authProvider" ? this.authProviders : this.textureProviders
        if (!providersMap.has(type)) LogHelper.fatal(`Invalid provider "${type}" in ${providerType} config`) //TODO перевод
        return providersMap.get(type)
    }

    private registerAuthProviders(): void {
        this.registerProvider(this.authProviders, AcceptAuthProvider)
        this.registerProvider(this.authProviders, RejectAuthProvider)
        this.registerProvider(this.authProviders, MojangAuthProvider)
    }

    private registerTextureProviders(): void {
        this.registerProvider(this.textureProviders, VoidTextureProvider)
    }

    private registerProvider(
        providerMap: ProviderMap<typeof AbstractProvider>,
        provider: typeof AbstractProvider
    ): void {
        providerMap.set(provider.getType(), provider)
    }
}
