import { IncomingMessage, ServerResponse } from "http"

import { JsonHelper } from "@root/helpers/JsonHelper"
import getRawBody from "raw-body"

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

    async getRequest(req: ExtendedIncomingMessage, res: ExtendedServerResponse): Promise<void> {
        const request = this.requests.find((r) => r.url.test(req.url))
        // нижние 2 обработчика корректны для api.mojang.com и authserver.mojang.com
        if (request === undefined)
            return res.writeHead(404).end(
                JsonHelper.toJSON({
                    error: "Not Found",
                    errorMessage: "The server has not found anything matching the request URI",
                })
            )
        if (request.method !== req.method)
            return res.writeHead(405).end(
                JsonHelper.toJSON({
                    error: "Method Not Allowed",
                    errorMessage:
                        "The method specified in the request is not allowed for the resource identified by the request URI",
                })
            )

        // Привет, кастомные обработчики
        req.query = new URLSearchParams(req.url.split("?")[1])

        res.error = (code = 400, error?: string, errorMessage?: string) => {
            res.writeHead(code).json({ error, errorMessage })
        }

        res.json = (data: object) => {
            res.setHeader("Content-Type", "application/json; charset=utf-8")
            res.end(JsonHelper.toJSON(data))
        }

        if (req.method === "POST") {
            if (!req.headers["content-type"] || !req.headers["content-type"].includes("application/json"))
                return res.error(400, "Invalid content-type header")

            try {
                req.body = await getRawBody(req, { limit: "500kb", encoding: "utf-8" })
            } catch (error) {
                return res.error(error.status || 400, error.message)
            }
        }

        request.emit(req, res)
    }
}

export class ExtendedIncomingMessage extends IncomingMessage {
    query: URLSearchParams
    body?: string
}

export class ExtendedServerResponse extends ServerResponse {
    error: (code?: number, error?: string, errorMessage?: string) => void
    json: (data: object) => void
}
