import * as http from "http"

import { JsonHelper } from "@auroralauncher/core"
import { NIL as NIL_UUID } from "uuid"
import * as ws from "ws"

import { LogHelper } from "../helpers/LogHelper"
import { wsErrorResponse } from "./websocket/types/ErrorResponse"
import { wsRequest } from "./websocket/types/Request"
import { wsResponse } from "./websocket/types/Response"
import { WsRequestsManager } from "./websocket/WsRequestsManager"

export class WebSocketManager {
    private webSocketServer: ws.WebSocketServer
    private requestsManager = new WsRequestsManager()

    public createWebSocket(wsServerOptions: ws.ServerOptions): void {
        this.webSocketServer = new ws.WebSocketServer(wsServerOptions)
        this.webSocketServer.on("connection", (ws: wsClient, req: http.IncomingMessage) => this.connectHandler(ws, req))

        const interval = setInterval(() => {
            this.webSocketServer.clients.forEach((ws: wsClient) => {
                if (ws.clientData.isAlive === false) return ws.terminate()

                ws.clientData.isAlive = false
                ws.ping()
            })
        }, 10000)

        this.webSocketServer.on("close", () => {
            clearInterval(interval)
        })
    }

    private connectHandler(ws: wsClient, req: http.IncomingMessage): void {
        ws.on("ping", ws.pong) // На случай всяких внешних проверок, аля чекалки статуса
        ws.on("pong", () => (ws.clientData.isAlive = true))
        // Добавляем хелпер
        ws.sendResponse = (data: wsResponse | wsErrorResponse) => ws.send(JsonHelper.toJSON(data))

        // Получаем IP юзера
        const clientIP = req.socket.remoteAddress
        // Разрешаем только один коннект на один IP
        // TODO Привет ребятам за NAT, сделать опционально (напишу, а то ещё опять забуду)
        if (Array.from(this.webSocketServer.clients).some((c: wsClient) => c.clientData?.ip === clientIP)) {
            ws.sendResponse({
                uuid: NIL_UUID,
                code: 99,
                message: "Only one connection allowed per IP",
            })
            return ws.terminate()
        }
        // Записываем данные юзера
        ws.clientData = {
            isAlive: true,
            ip: clientIP,
            isAuthed: false,
        }

        // Обработка приходящих сообщений
        ws.on("message", async (message: string) => {
            LogHelper.dev(`WebSocket request: ${message}`)
            let parsedMessage: wsRequest

            try {
                parsedMessage = JsonHelper.fromJSON(message)
            } catch (error) {
                return ws.sendResponse({
                    uuid: NIL_UUID,
                    code: 100,
                    message: error.message,
                })
            }

            if (parsedMessage.uuid === undefined) {
                return ws.sendResponse({
                    uuid: NIL_UUID,
                    code: 101,
                    message: "Request UUID is undefined",
                })
            }
            if (parsedMessage.type === undefined) {
                return ws.sendResponse({
                    uuid: parsedMessage.uuid,
                    code: 101,
                    message: "Request type is undefined",
                })
            }

            const response = await this.requestsManager.getRequest(parsedMessage, ws)
            LogHelper.dev(`WebSocket response: ${JsonHelper.toJSON(response)}`)
            ws.sendResponse({
                ...response,
                uuid: parsedMessage.uuid,
            })
        })
    }
}

export interface wsClient extends ws {
    clientData: {
        isAlive: boolean
        isAuthed: boolean
        ip: string
    }
    sendResponse: (data: wsResponse | wsErrorResponse) => void
}
