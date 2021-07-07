import { AbstractAuthProvider, AbstractAuthProviderConfig } from "../../auth/authProviders/AbstractAuthProvider"
import {
    AbstractTextureProvider,
    AbstractTextureProviderConfig,
} from "../../auth/textureProviders/AbstractTextureProvider"

export class AuthConfig {
    authProvider: AbstractAuthProviderConfig
    textureProvider: AbstractTextureProviderConfig

    static getDefaults(): AuthConfig {
        const defaults = new AuthConfig()
        defaults.authProvider = AbstractAuthProvider.getDefaultConfig()
        defaults.textureProvider = AbstractTextureProvider.getDefaultConfig()
        return defaults
    }
}
