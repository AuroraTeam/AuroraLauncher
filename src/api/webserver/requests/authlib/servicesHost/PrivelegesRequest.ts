import { ExtendedIncomingMessage, ExtendedServerResponse } from "@root/api/webserver/WebRequestManager"
import { App } from "@root/LauncherServer"

import { AbstractRequest } from "../../AbstractRequest"

export class PrivelegesRequest extends AbstractRequest {
    method = "GET"
    url = /^\/authlib\/privileges$/

    async emit(req: ExtendedIncomingMessage, res: ExtendedServerResponse): Promise<void> {
        const accessToken = req.headers.authorization

        if ("string" !== typeof accessToken || accessToken.length === 0) return res.error()

        const user = await App.AuthManager.getAuthProvider().privileges(accessToken.slice(7))

        res.json({
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
