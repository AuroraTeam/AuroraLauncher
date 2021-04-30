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

// TODO говнокод, здесь и во всех остальных файлах связанных с authlib, пофиксить!

import * as http from "http"

import { AuthlibRequest } from "./AuthlibRequest"
import { HasJoinedRequest } from "./sessionServer/HasJoinedRequest"
import { JoinRequest } from "./sessionServer/JoinRequest"
import { ProfileRequest } from "./sessionServer/ProfileRequest"

export class AuthlibManager {
    private requests: AuthlibRequest[] = []

    constructor() {
        this.registerRequest(new JoinRequest())
        this.registerRequest(new HasJoinedRequest())
        this.registerRequest(new ProfileRequest())
    }

    private registerRequest(request: AuthlibRequest): void {
        this.requests.push(request)
    }

    getRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
        const url = req.url.substring(8) // trim "/authlib"
        const request = this.requests.find((e) => e.method === req.method && e.url.test(url))
        if (request === undefined) {
            res.writeHead(404).end("Not found!")
            return
        }
        request.emit(req, res, url)
    }
}
