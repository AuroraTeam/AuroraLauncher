import { ExtendedIncomingMessage, ExtendedServerResponse } from "@root/api/webserver/WebRequestManager"
import { App } from "@root/LauncherServer"

import { AbstractRequest } from "../../AbstractRequest"

export class HasJoinedRequest extends AbstractRequest {
    method = "GET"
    url = /^\/authlib\/session\/minecraft\/hasJoined/

    async emit(req: ExtendedIncomingMessage, res: ExtendedServerResponse): Promise<void> {
        const data = req.query
        if (this.isEmptyQuery(data)) res.error()

        const username = data.get("username")
        const serverId = data.get("serverId")

        if (this.isInvalidValue(username) || this.isInvalidValue(serverId)) return res.error()

        let user
        try {
            user = await App.AuthManager.getAuthProvider().hasJoined(username, serverId)
        } catch (error) {
            return res.error(400, error.message)
        }

        const textures: any = {}
        if (user.skinUrl?.length > 0) {
            textures.SKIN = {
                url: user.skinUrl,
            }
        }
        if (user.capeUrl?.length > 0) {
            textures.CAPE = {
                url: user.capeUrl,
            }
        }

        const texturesValue = Buffer.from(
            JSON.stringify({
                timestamp: Date.now(),
                profileId: user.userUUID,
                profileName: username,
                signatureRequired: true,
                textures,
            })
        ).toString("base64")

        res.json({
            id: user.userUUID,
            name: username,
            properties: [
                {
                    name: "textures",
                    value: texturesValue,
                    signature: App.AuthlibManager.getSignature(texturesValue),
                },
            ],
        })
    }
}
