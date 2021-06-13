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
import { ProfilesRequest } from "./requests/authlib/accountsServer/ProfilesRequest"
import { PrivelegesRequest } from "./requests/authlib/servicesServer/PrivelegesRequest"
import { HasJoinedRequest } from "./requests/authlib/sessionServer/HasJoinedRequest"
import { JoinRequest } from "./requests/authlib/sessionServer/JoinRequest"
import { ProfileRequest } from "./requests/authlib/sessionServer/ProfileRequest"

export class WebRequestManager {
    private requests: AbstractRequest[] = []

    constructor() {
        this.registerRequest(new JoinRequest())
        this.registerRequest(new HasJoinedRequest())
        this.registerRequest(new ProfileRequest())
        this.registerRequest(new PrivelegesRequest())
        this.registerRequest(new ProfilesRequest())
    }

    registerRequest(request: AbstractRequest): void {
        this.requests.push(request)
    }

    getRequest(req: IncomingMessage, res: ServerResponse): void {
        res.setHeader("Content-Type", "application/json; charset=utf-8")

        const request = this.requests.find((e) => e.method === req.method && e.url.test(req.url))
        if (request === undefined) return res.writeHead(404).end("Not found!")
        request.emit(req, res)
    }
}
