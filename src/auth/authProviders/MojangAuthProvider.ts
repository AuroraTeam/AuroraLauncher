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

import { URL } from "url"

import { HttpHelper } from "../../helpers/HttpHelper"
import { AbstractAuthProvider, AuthResponseData } from "./AbstractAuthProvider"

export class MojangAuthProvider extends AbstractAuthProvider {
    static type = "mojang"

    async auth(login: string, password: string): Promise<AuthResponseData> {
        const data = JSON.stringify({
            agent: {
                name: "Minecraft",
                version: 1,
            },
            username: login,
            password,
        })

        const result = await HttpHelper.makePostRequest(
            new URL("authenticate", "https://authserver.mojang.com"),
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Content-Length": Buffer.byteLength(data),
                },
            },
            data
        )

        return {
            username: result.selectedProfile.name,
            userUUID: result.selectedProfile.id,
            accessToken: result.accessToken,
        }
    }

    join(): void {
        return // TODO
    }

    hasJoined(): any {
        return // TODO
    }

    profile(): any {
        return // TODO
    }
}
