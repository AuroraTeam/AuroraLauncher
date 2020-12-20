import * as http from "http"

import * as ws from "ws"

import { LogHelper } from "../helpers/LogHelper"
import { RequestsManager } from "./RequestsManager"
import { wsErrorResponse, wsRequest, wsResponse } from "./types/AbstractRequest"

export class WebSocketManager {
    webSocketServer: ws.Server
    requestsManager: RequestsManager = new RequestsManager()

    webSocketServerInit(wsServerOptions: ws.ServerOptions): void {
        this.webSocketServer = new ws.Server(wsServerOptions)
        this.webSocketServer.on("connection", (ws: ws, req: http.IncomingMessage) => this.requestListener(ws, req))
    }

    requestListener(ws: ws, req: http.IncomingMessage): void {
        ws.on("message", (message: string) => {
            LogHelper.dev(`New WebSocket request ${message}`)
            let data: wsRequest & {
                data: {
                    ip: string
                }
            }

            try {
                data = JSON.parse(message)
            } catch (error) {
                return this.wsSend(ws, {
                    uuid: data.uuid,
                    code: 100,
                    message: error.message,
                })
            }

            if (data.uuid === undefined) {
                return this.wsSend(ws, {
                    uuid: data.uuid,
                    code: 101,
                    message: "Request UUID is undefined",
                })
            }
            if (data.type === undefined) {
                return this.wsSend(ws, {
                    uuid: data.uuid,
                    code: 101,
                    message: "Request type is undefined",
                })
            }

            if (data.data === undefined) data.data = {ip: req.socket.remoteAddress}
            else data.data.ip = req.socket.remoteAddress

            this.wsSend(ws, this.requestsManager.getRequest(data))
        })
    }

    private wsSend(ws: ws, data: wsResponse | wsErrorResponse): void {
        ws.send(JSON.stringify(data))
    }
}
