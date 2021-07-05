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

import * as ws from "ws"

import { AbstractRequest } from "./requests/AbstractRequest"
import { AuthRequest } from "./requests/AuthRequest"
import { PingRequest } from "./requests/PingRequest"
import { ProfileRequest } from "./requests/ProfileRequest"
import { ServersRequest } from "./requests/ServersRequest"
import { UpdatesRequest } from "./requests/UpdatesRequest"
import { ErrorResponse, ResponseError, wsErrorResponse } from "./types/ErrorResponse"
import { wsRequest } from "./types/Request"
import { Response, wsResponse } from "./types/Response"

export class WsRequestsManager {
    private requests: Map<string, AbstractRequest> = new Map()

    constructor() {
        this.registerRequest(new PingRequest())
        this.registerRequest(new AuthRequest())
        this.registerRequest(new ServersRequest())
        this.registerRequest(new ProfileRequest())
        this.registerRequest(new UpdatesRequest())
    }

    registerRequest(request: AbstractRequest): void {
        this.requests.set(request.getType(), request)
    }

    async getRequest(data: wsRequest, ws: wsClient): Promise<Response | ErrorResponse> {
        if (!this.requests.has(data.type)) return new ResponseError(102, "Unknown request type").toJSON()

        try {
            // Проверка авторизации пользователя
            // Если пользователь не авторизован - дропать, если запрос не с авторизацией
            if (!ws.clientData.isAuthed && data.type !== "auth") throw new ResponseError(201, "Aвторизуйтесь")
            // Если пользователь авторизован - дропать, если он пытается повторно авторизоваться, иначе скип
            if (ws.clientData.isAuthed && data.type === "auth") throw new ResponseError(202, "Вы уже авторизованы")

            return { data: await this.requests.get(data.type).invoke(data.data, ws) }
        } catch (error) {
            if (error instanceof ResponseError) return error.toJSON()
            throw error // TODO
        }
    }
}

export interface wsClient extends ws {
    clientData: {
        isAlive: boolean
        isAuthed: boolean
        ip: string
    }
    sendResponse: (data: wsResponse | wsErrorResponse) => void
}
