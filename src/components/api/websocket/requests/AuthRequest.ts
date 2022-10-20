import { App } from "@root/LauncherServer"
import { AbstractRequest, ResponseResult } from "aurora-rpc-server"

type WebSocketClient = Parameters<AbstractRequest["invoke"]>["1"]

// Сломано :)

export class AuthRequest extends AbstractRequest {
    method = "auth"

    /**
     * It takes a login and password, passes them to the auth provider, and returns the result
     * @param {AuthRequestData} data - AuthRequestData - the data that was sent from the client
     * @param {WebSocketClient} ws - WebSocketClient - the client that sent the request
     * @returns ResponseResult
     */
    async invoke(
        data: AuthRequestData,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ws: WebSocketClient
    ): Promise<ResponseResult> {
        const provider = App.AuthManager.getAuthProvider()
        const res = await provider.auth(data.login, data.password)
        // ws.isAuthed = true
        return res
    }
}

interface AuthRequestData {
    login: string
    password: string
}
