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

import { AbstractProvider } from "./AbstractProvider"
import { AbstractAuthProvider } from "./authProviders/AbstractAuthProvider"
import { AcceptAuthProvider } from "./authProviders/AcceptAuthProvider"
import { RejectAuthProvider } from "./authProviders/RejectAuthProvider"
import { AbstractTextureProvider } from "./textureProviders/AbstractTextureProvider"

type ProviderMap<P> = Map<string, P>

export class AuthManager {
    authProviders: ProviderMap<typeof AbstractAuthProvider> = new Map()
    textureProviders: ProviderMap<typeof AbstractTextureProvider> = new Map()

    constructor() {
        this.registerAuthProviders()
        this.registerTextureProviders()
    }

    registerAuthProviders(): void {
        this.registerAuthProvider(AcceptAuthProvider)
        this.registerAuthProvider(RejectAuthProvider)
    }

    registerTextureProviders(): void {
        return
    }

    registerAuthProvider(provider: typeof AbstractAuthProvider): void {
        this.registerProvider(this.authProviders, provider)
    }

    registerTextureProvider(provider: typeof AbstractTextureProvider): void {
        this.registerProvider(this.textureProviders, provider)
    }

    registerProvider(providerMap: ProviderMap<typeof AbstractProvider>, provider: typeof AbstractProvider): void {
        providerMap.set(provider.getType(), provider)
    }
}
