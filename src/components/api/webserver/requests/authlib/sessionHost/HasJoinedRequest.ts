import { IncomingMessage, ServerResponse } from "http"

import { App } from "@root/app"
import { HttpHelper, JsonHelper } from "@root/utils"

import { AbstractRequest } from "../../AbstractRequest"

export class HasJoinedRequest extends AbstractRequest {
    method = "GET"
    url = /^\/authlib\/sessionserver\/session\/minecraft\/hasJoined/

    async emit(req: IncomingMessage, res: ServerResponse): Promise<void> {
        const data = HttpHelper.parseQuery(req.url)
        if (HttpHelper.isEmptyQuery(data)) return HttpHelper.sendError(res)

        const username = data.get("username")
        const serverId = data.get("serverId")

        if (this.isInvalidValue(username) || this.isInvalidValue(serverId))
            return HttpHelper.sendError(res)

        let user
        try {
            user = await App.AuthManager.getAuthProvider().hasJoined(
                username,
                serverId
            )
        } catch (error) {
            return HttpHelper.sendError(res, 400, error.message)
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

        HttpHelper.sendJson(res, {
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
