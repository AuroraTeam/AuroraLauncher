import { App } from "../../../LauncherServer"
import { wsClient } from "../../WebSocketManager"
import { RequestData } from "../types/Request"
import { ResponseData } from "../types/Response"
import { AbstractRequest } from "./AbstractRequest"

export class AuthRequest extends AbstractRequest {
    type = "auth"

    async invoke(data: AuthRequestData, ws: wsClient): Promise<ResponseData> {
        const provider = App.AuthManager.getAuthProvider()
        const res = await provider.auth(data.login, data.password)
        ws.clientData.isAuthed = true
        return res
    }
}

interface AuthRequestData extends RequestData {
    login: string
    password: string
}
