import { IncomingMessage, ServerResponse } from "http"

import { App } from "@root/app"
import { HttpHelper } from "@root/utils"

import { AbstractRequest } from "../../AbstractRequest"

export class PrivelegesRequest extends AbstractRequest {
    method = "GET"
    url = /^\/authlib\/minecraftservices\/privileges$/

    async emit(req: IncomingMessage, res: ServerResponse): Promise<void> {
        const accessToken = req.headers.authorization

        if ("string" !== typeof accessToken || accessToken.trim().length === 0)
            return HttpHelper.sendError(res)

        const user = await App.AuthManager.getAuthProvider().privileges(
            accessToken.slice(7)
        )

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
