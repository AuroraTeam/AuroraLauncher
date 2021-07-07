import { IncomingMessage, ServerResponse } from "http"

import { JsonHelper } from "@root/helpers/JsonHelper"
import UUIDHelper from "@root/helpers/UUIDHelper"
import { App } from "@root/LauncherServer"

import { AbstractRequest } from "../../AbstractRequest"

export class HasJoinedRequest extends AbstractRequest {
    method = "GET"
    url = /^\/authlib\/session\/minecraft\/hasJoined$/

    async emit(req: IncomingMessage, res: ServerResponse): Promise<void> {
        res.statusCode = 400
        const data = this.parseQuery(req.url)
        if (this.isEmptyQuery(data)) res.end()

        const username = data.get("username")
        const serverId = data.get("serverId")

        if (this.isInvalidValue(username) || this.isInvalidValue(serverId)) return res.end()

        // TODO
        // Если IP указан
        const ip = data.get("ip")
        if (ip && this.isInvalidValue(ip)) {
            return res.end()
        }

        let user
        try {
            user = await App.AuthManager.getAuthProvider().hasJoined(username, serverId)
        } catch (error) {
            return res.end()
        }

        const userUUID = UUIDHelper.getWithoutDashes(user.userUUID)

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
                profileId: userUUID,
                profileName: username,
                signatureRequired: true,
                textures,
            })
        ).toString("base64")

        res.write(
            JsonHelper.toJSON({
                id: userUUID,
                name: username,
                properties: [
                    {
                        name: "textures",
                        value: texturesValue,
                        signature: App.AuthlibManager.getSignature(texturesValue),
                    },
                ],
            })
        )
        res.statusCode = 200
        res.end()
    }
}
