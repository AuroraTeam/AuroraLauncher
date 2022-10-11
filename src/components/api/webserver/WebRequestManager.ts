import { IncomingMessage, ServerResponse } from "http"

import { JsonHelper } from "@root/utils"

import { AbstractRequest } from "./requests/AbstractRequest"
import { ProfilesRequest } from "./requests/authlib/accountsHost/ProfilesRequest"
import { PrivelegesRequest } from "./requests/authlib/servicesHost/PrivelegesRequest"
import { HasJoinedRequest } from "./requests/authlib/sessionHost/HasJoinedRequest"
import { JoinRequest } from "./requests/authlib/sessionHost/JoinRequest"
import { ProfileRequest } from "./requests/authlib/sessionHost/ProfileRequest"
import { InjectorRequest } from "./requests/InjectorRequest"

export class WebRequestManager {
    private requests: AbstractRequest[] = []

    constructor() {
        this.registerRequest(new JoinRequest())
        this.registerRequest(new HasJoinedRequest())
        this.registerRequest(new ProfileRequest())
        this.registerRequest(new PrivelegesRequest())
        this.registerRequest(new ProfilesRequest())
        this.registerRequest(new InjectorRequest())
    }

    registerRequest(request: AbstractRequest): void {
        this.requests.push(request)
    }

    async getRequest(req: IncomingMessage, res: ServerResponse) {
        res.setHeader("X-Authlib-Injector-API-Location", "/authlib")
        const request = this.requests.find((r) => r.url.test(req.url))
        // Нижние 2 обработчика корректны для api.mojang.com и authserver.mojang.com
        if (request === undefined)
            return res.writeHead(404).end(
                JsonHelper.toJson({
                    error: "Not Found",
                    errorMessage:
                        "The server has not found anything matching the request URI",
                })
            )
        if (request.method !== req.method)
            return res.writeHead(405).end(
                JsonHelper.toJson({
                    error: "Method Not Allowed",
                    errorMessage:
                        "The method specified in the request is not allowed for the resource identified by the request URI",
                })
            )
        // Обработчики ниже срезают ~20к запросов (avg ~4k req/sec)
        // if (request === undefined)
        //     return HttpHelper.sendError(
        //         res,
        //         404,
        //         "Not Found",
        //         "The server has not found anything matching the request URI"
        //     )
        // if (request.method !== req.method)
        //     return HttpHelper.sendError(
        //         res,
        //         405,
        //         "Method Not Allowed",
        //         "The method specified in the request is not allowed for the resource identified by the request URI"
        //     )
        request.emit(req, res)
    }
}
