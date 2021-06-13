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

import { AbstractRequest } from "./requests/AbstractRequest"
import { HasJoinedRequest } from "./requests/authlib/sessionServer/HasJoinedRequest"
import { JoinRequest } from "./requests/authlib/sessionServer/JoinRequest"
import { ProfileRequest } from "./requests/authlib/sessionServer/ProfileRequest"

export class WebRequestManager {
    private requests: AbstractRequest[] = []

    constructor() {
        this.registerRequest(new JoinRequest())
        this.registerRequest(new HasJoinedRequest())
        this.registerRequest(new ProfileRequest())
    }

    registerRequest(request: AbstractRequest): void {
        this.requests.push(request)
    }

    getRequest(req: IncomingMessage, res: CustomServerResponse): void {
        res.setHeader("Content-Type", "application/json; charset=utf-8")

        const request = this.requests.find((e) => e.method === req.method && e.url.test(req.url))
        if (request === undefined) {
            res.writeHead(404).end("Not found!")
            return
        }

        // Не ну ачё
        res.writeStatus = function (code: number) {
            this.writeHead(code).end()
        }

        request.emit(req, res)
    }
}

export interface CustomServerResponse extends ServerResponse {
    writeStatus?: (code: number) => void
}
