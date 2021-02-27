/**
 * AuroraLauncher LauncherServer - Server for AuroraLauncher
 * Copyright (C) 2020 - 2021 AuroraTeam

 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.

 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.

 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { AuthHandlerConfig } from "../auth/authHandlers/AbstractHandler"
import { PrimaryProviderConfig } from "../auth/primaryProviders/AbstractProvider"
import { SecondProviderConfig } from "../auth/secondaryProviders/AbstractProvider"
import { TextureProviderConfig } from "../auth/textureProviders/AbstractTextureProvider"
import { HwidHandlerConfig } from "../hwid/AbstractHwidHandler"

export class WebSocketConfig {
    address: string
    ip: string
    port: number
    enableListing: boolean
    hideListing: boolean
    useSSL: boolean
    ssl: {
        cert: string
        key: string
    }

    static getDefaults(): WebSocketConfig {
        const defaults = new WebSocketConfig()
        defaults.address = "ws://localhost:1370/"
        defaults.ip = "0.0.0.0"
        defaults.port = 1370
        defaults.enableListing = true
        defaults.hideListing = false
        defaults.useSSL = false
        defaults.ssl = {
            cert: "/path/to/cert.pem",
            key: "/path/to/key.pem",
        }
        return defaults
    }
}

export class AuthConfig {
    primaryProvider: PrimaryProviderConfig
    secondProvider: SecondProviderConfig
    authHandler: AuthHandlerConfig
    textureProvider: TextureProviderConfig

    static getDefaults(): AuthConfig {
        const defaults = new AuthConfig()
        defaults.primaryProvider = PrimaryProviderConfig.getDefaults()
        defaults.secondProvider = SecondProviderConfig.getDefaults()
        defaults.authHandler = AuthHandlerConfig.getDefaults()
        defaults.textureProvider = TextureProviderConfig.getDefaults()
        return defaults
    }
}

export enum Envirovement {
    PRODUCTION = "prod",
    DEBUG = "debug",
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
