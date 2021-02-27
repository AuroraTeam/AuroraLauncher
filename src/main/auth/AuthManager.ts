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

import { AbstractProvider } from "./primaryProviders/AbstractProvider"
import { AcceptAuthProvider } from "./primaryProviders/AcceptAuthProvider"
import { RejectAuthProvider } from "./primaryProviders/RejectAuthProvider"

export class AuthManager {
    providers: Map<string, AbstractProvider> = new Map()

    constructor() {
        this.registerHandlers()
        this.registerHwidHandlers()
        this.registerProviders()
        this.registerTextureProviders()
    }

    registerHandlers(): void {
        return
    }

    registerHwidHandlers(): void {
        return
    }

    registerProviders(): void {
        this.registerProvider(new AcceptAuthProvider())
        this.registerProvider(new RejectAuthProvider())
        return
    }

    registerProvider(provider: AbstractProvider): void {
        this.providers.set(provider.getType(), provider)
    }

    registerTextureProviders(): void {
        return
    }
}
