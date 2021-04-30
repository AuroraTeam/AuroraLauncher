import { IncomingMessage } from "http"

import { JsonHelper } from "../../../helpers/JsonHelper"
import { App } from "../../../LauncherServer"
import { CustomServerResponse } from "../AuthlibManager"
import { AuthlibRequest } from "../AuthlibRequest"

export class HasJoinedRequest extends AuthlibRequest {
    method = "GET"
    url = /^\/session\/minecraft\/hasJoined/

    emit(_req: IncomingMessage, res: CustomServerResponse, url: string): void {
        const data = this.parseQuery(url)
        if (this.isEmptyQuery(data)) res.writeStatus(400)

        const username = data.get("username")
        const serverId = data.get("serverId")

        if (
            "string" !== typeof username ||
            username.length === 0 ||
            "string" !== typeof serverId ||
            serverId.length === 0
        )
            return res.writeStatus(400)

        // TODO
        // Если IP указан
        const ip = data.get("ip")
        if (ip !== null && ("string" !== typeof ip || ip.length === 0)) {
            return res.writeStatus(400)
        }

        let user
        try {
            user = App.AuthManager.getAuthProvider().hasJoined(username, serverId)
        } catch (error) {
            return res.writeStatus(400)
        }

        res.write(
            JsonHelper.toJSON({
                id: user.userUUID,
                name: username,
                properties: [
                    {
                        name: "textures",
                        value: Buffer.from(
                            JSON.stringify({
                                timestamp: Date.now(),
                                profileId: user.userUUID,
                                profileName: username,
                                textures: {
                                    SKIN: {
                                        url:
                                            "http://textures.minecraft.net/texture/7bc6395501fe9296091d995317d1f0578db073ce0e384b52ecd851c6e955aecf",
                                    },
                                },
                            })
                        ).toString("base64"),
                    },
                ],
            })
        )
        res.end()
    }
}
