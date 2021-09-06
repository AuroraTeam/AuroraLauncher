import { IncomingMessage, ServerResponse } from "http"

import { HttpHelper } from "@root/helpers/HttpHelper"
import { App } from "@root/LauncherServer"

import { AbstractRequest } from "../../AbstractRequest"

export class PrivelegesRequest extends AbstractRequest {
    method = "GET"
    url = /^\/authlib\/privileges$/

    async emit(req: IncomingMessage, res: ServerResponse): Promise<void> {
        const accessToken = req.headers.authorization

        if ("string" !== typeof accessToken || accessToken.trim().length === 0) return HttpHelper.sendError(res)

        const user = await App.AuthManager.getAuthProvider().privileges(accessToken.slice(7))

        HttpHelper.sendJson(res, {
            privileges: {
                onlineChat: {
                    enabled: user.onlineChat,
                },
                multiplayerServer: {
                    enabled: user.multiplayerServer,
                },
                multiplayerRealms: {
                    enabled: user.multiplayerRealms,
                },
                telemetry: {
                    enabled: user.telemetry,
                },
            },
        })
    }
}
