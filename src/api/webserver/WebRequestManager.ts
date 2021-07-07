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
