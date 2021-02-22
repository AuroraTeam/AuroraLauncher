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

import { AbstractRequest, wsErrorResponse, wsRequest, wsResponse } from "./types/AbstractRequest"
import { AuthRequest } from "./types/AuthRequest"
import { PingRequest } from "./types/PingRequest"
import { ServersRequest } from "./types/ServersRequest"
import { UnknownRequest } from "./types/UnknownRequest"

export class RequestsManager {
    requests: Map<string, AbstractRequest> = new Map()

    constructor() {
        this.registerRequest(new UnknownRequest())
        this.registerRequest(new PingRequest())
        this.registerRequest(new AuthRequest())
        this.registerRequest(new ServersRequest())
    }

    registerRequest(x: AbstractRequest): void {
        this.requests.set(x.getType(), x)
    }

    getRequest(data: wsRequest): wsResponse | wsErrorResponse {
        let res
        if (this.requests.has(data.type)) {
            res = this.requests.get(data.type).invoke(data)
        } else {
            res = this.requests.get("unknown").invoke(data)
        }
        return {
            ...res,
            uuid: data.uuid,
        }
    }
}
