import { IncomingMessage, ServerResponse } from "http"

import { JsonHelper } from "@root/helpers/JsonHelper"
import { App } from "@root/LauncherServer"

import { AbstractRequest } from "../../AbstractRequest"

export class PrivelegesRequest extends AbstractRequest {
    method = "GET"
    url = /^\/authlib\/privileges$/

    async emit(req: IncomingMessage, res: ServerResponse): Promise<void> {
        const accessToken = req.headers.authorization

        if ("string" !== typeof accessToken || accessToken.length === 0) {
            res.statusCode = 400
            return res.end()
        }

        let user
        try {
            user = await App.AuthManager.getAuthProvider().privileges(accessToken.slice(7))
        } catch (error) {
            res.statusCode = 400
            return res.end()
        }

        res.write(
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
        res.end()
    }
}
