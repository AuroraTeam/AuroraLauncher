import { App } from "@root/app"
import { AbstractRequest, JsonObject, ResponseResult } from "aurora-rpc-server"
import { WebSocketClient } from "aurora-rpc-server/dist/types/types/Client" // TODO

// Сломано :)

export class AuthRequest extends AbstractRequest {
    method = "auth"

    /**
     * It takes a login and password, passes them to the auth provider, and returns the result
     * @param {AuthRequestData} data - AuthRequestData - the data that was sent from the client.
     * @param "{WebSocketClient} ws - WebSocketClient - the client that sent the request"
     * @returns ResponseResult
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
