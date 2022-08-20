import { App } from "@root/LauncherServer"
import { AbstractRequest, JsonObject, ResponseResult } from "aurora-rpc-server"
import { WebSocketClient } from "aurora-rpc-server/dist/types/types/Client" // TODO

// Сломано :)

export class AuthRequest extends AbstractRequest {
    method = "auth"

    async invoke(data: AuthRequestData, ws: WebSocketClient): Promise<ResponseResult> {
        const provider = App.AuthManager.getAuthProvider()
        const res = await provider.auth(data.login, data.password)
        // ws.isAuthed = true
        return res
    }
}

interface AuthRequestData extends JsonObject {
    login: string
    password: string
}
