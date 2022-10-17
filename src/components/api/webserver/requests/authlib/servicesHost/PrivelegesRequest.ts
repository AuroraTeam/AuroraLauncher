import { App } from "@root/app"

import { WebRequest } from "../../../WebRequest"
import { WebResponse } from "../../../WebResponse"
import { AbstractRequest } from "../../AbstractRequest"

export class PrivelegesRequest extends AbstractRequest {
    method = "GET"
    url = /^\/authlib\/minecraftservices\/privileges$/

    async emit(req: WebRequest, res: WebResponse): Promise<void> {
        const accessToken = req.raw.headers.authorization

        if ("string" !== typeof accessToken || accessToken.trim().length === 0)
            return res.sendError()

        const user = await App.AuthManager.getAuthProvider().privileges(
            accessToken.slice(7)
        )

        res.sendJson({
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
