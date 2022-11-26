import { AuthManager } from "@root/components/auth"
import { AbstractRequest, ResponseResult } from "aurora-rpc-server"
import { injectable } from "tsyringe"

type WebSocketClient = Parameters<AbstractRequest["invoke"]>["1"]

export interface ExtendedWebSocketClient extends WebSocketClient {
    isAuthed: boolean
}

@injectable()
export class AuthRequest extends AbstractRequest {
    method = "auth"

    constructor(private authManager: AuthManager) {
        super()
    }

    /**
     * It takes a login and password, passes them to the auth provider, and returns the result
     * @param data - the data that was sent from the client
     * @param ws - the client that sent the request
     * @returns ResponseResult
     */
    async invoke(
        data: AuthRequestData,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ws: ExtendedWebSocketClient
    ): Promise<ResponseResult> {
        const provider = this.authManager.getAuthProvider()
        const res = await provider.auth(data.login, data.password)
        ws.isAuthed = true
        return res
    }
}

interface AuthRequestData {
    login: string
    password: string
}
