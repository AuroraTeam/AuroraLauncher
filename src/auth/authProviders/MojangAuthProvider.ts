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

import { HttpHelper } from "../../helpers/HttpHelper"
import { App } from "../../LauncherServer"
import { AbstractAuthProvider, AbstractAuthProviderConfig, AuthResponseData } from "./AbstractAuthProvider"

export class MojangAuthProvider extends AbstractAuthProvider {
    static type = "mojang"
    private config: MojangAuthProviderConfig

    constructor() {
        super()
        const config = App.ConfigManager.getConfig().auth.authProvider as MojangAuthProviderConfig
        this.config = {
            type: "mojang",
            authHost: config.authHost || "https://authserver.mojang.com",
            accountHost: config.accountHost || "https://api.mojang.com",
            sessionHost: config.sessionHost || "https://sessionserver.mojang.com",
            servicesHost: config.servicesHost || "https://api.minecraftservices.com",
        }
    }

    async auth(username: string, password: string): Promise<AuthResponseData> {
        const data = JSON.stringify({
            agent: {
                name: "Minecraft",
                version: 1,
            },
            username,
            password,
        })

        const result = await HttpHelper.makePostRequest(new URL("authenticate", this.config.authHost), data)

        return {
            username: result.selectedProfile.name,
            userUUID: result.selectedProfile.id,
            accessToken: result.accessToken,
        }
    }

    join(): any {
        return // Doesn't need implementation
    }

    hasJoined(): any {
        return // Doesn't need implementation
    }

    profile(): any {
        return // Doesn't need implementation
    }
}

interface MojangAuthProviderConfig extends AbstractAuthProviderConfig {
    authHost: string
    accountHost: string
    sessionHost: string
    servicesHost: string
}
