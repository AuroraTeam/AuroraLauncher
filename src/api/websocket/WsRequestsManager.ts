import { wsClient } from "../WebSocketManager"
import { AbstractRequest } from "./requests/AbstractRequest"
import { AuthRequest } from "./requests/AuthRequest"
import { PingRequest } from "./requests/PingRequest"
import { ProfileRequest } from "./requests/ProfileRequest"
import { ServersRequest } from "./requests/ServersRequest"
import { UpdatesRequest } from "./requests/UpdatesRequest"
import { ResponseError } from "./ResponseError"
import { ErrorResponse } from "./types/ErrorResponse"
import { wsRequest } from "./types/Request"
import { Response } from "./types/Response"

export class WsRequestsManager {
    private requests: Map<string, AbstractRequest> = new Map()

    constructor() {
        this.registerRequest(new PingRequest())
        this.registerRequest(new AuthRequest())
        this.registerRequest(new ServersRequest())
        this.registerRequest(new ProfileRequest())
        this.registerRequest(new UpdatesRequest())
    }

    private registerRequest(request: AbstractRequest): void {
        this.requests.set(request.getType(), request)
    }

    public async getRequest({ data, type }: wsRequest, ws: wsClient): Promise<Response | ErrorResponse> {
        if (!this.requests.has(type)) return new ResponseError(102, "Unknown request type").toJSON()

        try {
            // Проверка авторизации пользователя
            // Если пользователь не авторизован - дропать, если запрос не с авторизацией
            if (!ws.clientData.isAuthed && type !== "auth") throw new ResponseError(201, "Aвторизуйтесь")
            // Если пользователь авторизован - дропать, если он пытается повторно авторизоваться, иначе скип
            if (ws.clientData.isAuthed && type === "auth") throw new ResponseError(202, "Вы уже авторизованы")

            return { data: await this.requests.get(type).invoke(data, ws) }
        } catch (error) {
            if (error instanceof ResponseError) return error.toJSON()
            throw error // TODO
        }
    }
}
