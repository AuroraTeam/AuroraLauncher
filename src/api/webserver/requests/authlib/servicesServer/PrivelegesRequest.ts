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

import { IncomingMessage, ServerResponse } from "http"

import { JsonHelper } from "@root/helpers/JsonHelper"
import { App } from "@root/LauncherServer"

import { AbstractRequest } from "../../AbstractRequest"

export class PrivelegesRequest extends AbstractRequest {
    method = "GET"
    url = /^\/authlib\/privileges$/

    async emit(req: IncomingMessage, res: ServerResponse): Promise<void> {
        const accessToken = req.headers.authorization

        if ("string" !== typeof accessToken || accessToken.length === 0) {
            res.statusCode = 400
            return res.end()
        }

        let user
        try {
            user = await App.AuthManager.getAuthProvider().privileges(accessToken.slice(7))
        } catch (error) {
            res.statusCode = 400
            return res.end()
        }

        res.write(
            JsonHelper.toJSON({
                privileges: {
                    onlineChat: {
                        enabled: user.onlineChat,
                    },
                    multiplayerServer: {
                        enabled: user.multiplayerServer,
                    },
                    multiplayerRealms: {
                        enabled: user.multiplayerRealms,
                    },
                    telemetry: {
                        enabled: user.telemetry,
                    },
                },
            })
        )
        res.end()
    }
}
