import * as ws from "ws"

import { LogHelper } from "../helpers/LogHelper"
import { AbstractRequest, wsErrorResponse, wsRequest, wsResponse } from "./types/AbstractRequest"
import { PingRequest } from "./types/PingRequest"
import { UnknownRequest } from "./types/UnknownRequest"

export class WebSocketManager {
    webSocketServer: ws.Server
    requests: Map<string, AbstractRequest> = new Map()

    constructor() {
        this.registerRequest(new UnknownRequest())
        this.registerRequest(new PingRequest())
    }

    webSocketServerInit(wsServerOptions: ws.ServerOptions): void {
        this.webSocketServer = new ws.Server(wsServerOptions)
        this.webSocketServer.on("connection", (ws: ws) => this.requestListener(ws))
    }

    registerRequest(x: AbstractRequest): void {
        this.requests.set(x.getType(), x)
    }

    requestListener(ws: ws): void {
        ws.on("message", (message: string) => {
            LogHelper.dev(`New WebSocket request ${message}`)
            let data: wsRequest
            try {
                data = JSON.parse(message)
            } catch (error) {
                return this.wsSend(ws, {
                    uuid: data.uuid,
                    code: 100,
                    message: error.message,
                })
            }
            if (this.requests.has(data.type)) {
                this.wsSend(ws, this.requests.get(data.type).invoke(data))
            } else {
                this.wsSend(ws, this.requests.get("unknown").invoke(data))
            }
        })
    }

    private wsSend(ws: ws, data: wsResponse | wsErrorResponse): void {
        ws.send(JSON.stringify(data))
    }
}
