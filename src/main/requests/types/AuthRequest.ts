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

// TODO Только одна авторизация на клиента

import { LogHelper } from "../../helpers/LogHelper"
import { App } from "../../LauncherServer"
import { AbstractRequest, wsErrorResponseWithoutUUID, wsRequest, wsResponseWithoutUUID } from "./AbstractRequest"

export class AuthRequest extends AbstractRequest {
    type = "auth"

    invoke({ data }: wsAuthRequest): wsResponseWithoutUUID | wsErrorResponseWithoutUUID {
        const provider = App.AuthManager.getAuthProvider()
        if (provider === undefined) {
            LogHelper.error("authProvider is undefined")
            return {
                code: 103,
                message: "authProvider is undefined",
            }
        }

        return provider.emit(data.login, data.password, data.ip)
    }
}

interface wsAuthRequest extends wsRequest {
    data: {
        login: string
        password: string
        ip: string
    }
}
