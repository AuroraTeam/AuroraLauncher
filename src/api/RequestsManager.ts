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

import { AbstractRequest } from "./requests/AbstractRequest"
import { AuthRequest } from "./requests/AuthRequest"
import { PingRequest } from "./requests/PingRequest"
import { ProfileRequest } from "./requests/ProfileRequest"
import { ServersRequest } from "./requests/ServersRequest"
import { UpdatesRequest } from "./requests/UpdatesRequest"
import { ErrorResponse } from "./types/ErrorResponse"
import { wsRequest } from "./types/Request"
import { Response } from "./types/Response"

export class RequestsManager {
    requests: Map<string, AbstractRequest> = new Map()

    constructor() {
        this.registerRequest(new PingRequest())
        this.registerRequest(new AuthRequest())
        this.registerRequest(new ServersRequest())
        this.registerRequest(new ProfileRequest())
        this.registerRequest(new UpdatesRequest())
    }

    registerRequest(x: AbstractRequest): void {
        this.requests.set(x.getType(), x)
    }

    async getRequest(data: wsRequest): Promise<Response | ErrorResponse> {
        if (!this.requests.has(data.type))
            return {
                code: 102,
                message: "Unknown request type",
            }

        try {
            return { data: await this.requests.get(data.type).invoke(data.data) }
        } catch (error) {
            // TODO продумать
            return error
        }
    }
}
