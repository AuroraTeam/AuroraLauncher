import { App } from "@root/LauncherServer"
import { JsonHelper } from "@root/utils"

import { WebRequest } from "../../../WebRequest"
import { WebResponse } from "../../../WebResponse"
import { AbstractRequest } from "../../AbstractRequest"

export class HasJoinedRequest extends AbstractRequest {
    method = "GET"
    url = /^\/authlib\/sessionserver\/session\/minecraft\/hasJoined/

    async emit(req: WebRequest, res: WebResponse): Promise<void> {
        const { username, serverId } = req.query

        if (this.isInvalidValue(username) || this.isInvalidValue(serverId))
            return res.sendError()

        let user
        try {
            user = await App.AuthManager.getAuthProvider().hasJoined(
                username,
                serverId
            )
        } catch (error) {
            return res.sendError(400, error.message)
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
            JsonHelper.toJson({
                timestamp: Date.now(),
                profileId: user.userUUID,
                profileName: username,
                signatureRequired: true,
                textures,
            })
        ).toString("base64")

        res.sendJson({
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
