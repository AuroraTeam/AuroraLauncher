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

import * as http from "http"
import { AuthlibRequest } from "./AuthlibRequest"
import { HasJoinedRequest } from "./sessionServer/HasJoinedRequest"
import { JoinRequest } from "./sessionServer/JoinRequest"

export class AuthlibManager {
    private requests: RequestMeta[] = []

    constructor() {
        this.registerRequest(new JoinRequest())
        this.registerRequest(new HasJoinedRequest())
    }

    private registerRequest(request: AuthlibRequest): void {
        this.requests.push({
            ...request.getMeta(),
            handler: request
        })
    }

    getRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
        const request = this.requests
            .find(
                e => e.method === req.method &&
                RegExp(e.url).test(req.url.substring(8))
            )
        if (request === undefined) {
            res.writeHead(404)
            res.end("Not found!")
            return
        }
        request.handler.emit(req, res)
    }
}

export interface RequestMeta {
    url: string;
    method: string;
    handler: AuthlibRequest;
}
