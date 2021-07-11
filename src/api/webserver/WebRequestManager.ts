import { IncomingMessage, ServerResponse } from "http"

import { AbstractRequest } from "./requests/AbstractRequest"
import { ProfilesRequest } from "./requests/authlib/accountsHost/ProfilesRequest"
import { PrivelegesRequest } from "./requests/authlib/servicesHost/PrivelegesRequest"
import { HasJoinedRequest } from "./requests/authlib/sessionHost/HasJoinedRequest"
import { JoinRequest } from "./requests/authlib/sessionHost/JoinRequest"
import { ProfileRequest } from "./requests/authlib/sessionHost/ProfileRequest"

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

        const request = this.requests.find((e) => e.url.test(req.url))
        // нижние 2 обработчика корректны для api.mojang.com и authserver.mojang.com
        if (request === undefined)
            return res
                .writeHead(404)
                .end(
                    AbstractRequest.returnError(
                        "Not Found",
                        "The server has not found anything matching the request URI"
                    )
                )
        if (request.method !== req.method)
            return res
                .writeHead(405)
                .end(
                    AbstractRequest.returnError(
                        "Method Not Allowed",
                        "The method specified in the request is not allowed for the resource identified by the request URI"
                    )
                )
        request.emit(req, res)
    }
}
