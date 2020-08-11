import { AuthHandlerConfig } from "../auth/authHandlers/AbstractHandler"
import { PrimaryProviderConfig } from "../auth/primaryProviders/AbstractProvider"
import { SecondProviderConfig } from "../auth/secondaryProviders/AbstractProvider"
import { TextureProviderConfig } from "../auth/textureProviders/AbstractTextureProvider"
import { HwidHandlerConfig } from "../hwid/AbstractHwidHandler"

export class WebSocketConfig {
    address: string
    ip: string
    port: number
}

export class AuthConfig {
    primaryProvider: PrimaryProviderConfig
    secondProvider: SecondProviderConfig
    authHandler: AuthHandlerConfig
    textureProvider: TextureProviderConfig
}

export enum Envirovement {
    PRODUCTION = "prod",
    DEV = "dev",
}

export class LauncherServerConfig {
    configVersion: string
    lang: string

    env: Envirovement

    updatesUrl: Array<string>

    auth: AuthConfig
    hwid: HwidHandlerConfig

    ws: WebSocketConfig
}
