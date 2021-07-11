import { IncomingMessage, ServerResponse } from "http"

import { JsonHelper } from "@root/helpers/JsonHelper"
import { App } from "@root/LauncherServer"

import { AbstractRequest } from "../../AbstractRequest"

export class PrivelegesRequest extends AbstractRequest {
    method = "GET"
    url = /^\/authlib\/privileges$/

    async emit(req: IncomingMessage, res: ServerResponse): Promise<void> {
        const accessToken = req.headers.authorization
        res.statusCode = 400

        if ("string" !== typeof accessToken || accessToken.length === 0) {
            return res.end()
        }

        let user
        try {
            user = await App.AuthManager.getAuthProvider().privileges(accessToken.slice(7))
        } catch (error) {
            return res.end()
        }

        res.statusCode = 200
        res.end(
            JsonHelper.toJSON({
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
        )
    }
}
