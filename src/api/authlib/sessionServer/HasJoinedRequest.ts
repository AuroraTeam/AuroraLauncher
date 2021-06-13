import { IncomingMessage } from "http"

import { JsonHelper } from "../../../helpers/JsonHelper"
import UUIDHelper from "../../../helpers/UUIDHelper"
import { App } from "../../../LauncherServer"
import { CustomServerResponse } from "../AuthlibManager"
import { AuthlibRequest } from "../AuthlibRequest"

export class HasJoinedRequest extends AuthlibRequest {
    method = "GET"
    url = /^\/session\/minecraft\/hasJoined/

    async emit(_req: IncomingMessage, res: CustomServerResponse, url: string): Promise<void> {
        const data = this.parseQuery(url)
        if (this.isEmptyQuery(data)) res.writeStatus(400)

        const username = data.get("username")
        const serverId = data.get("serverId")

        if (this.isInvalidValue(username) || this.isInvalidValue(serverId)) return res.writeStatus(400)

        // TODO
        // Если IP указан
        const ip = data.get("ip")
        if (ip && this.isInvalidValue(ip)) {
            return res.writeStatus(400)
        }

        let user
        try {
            user = await App.AuthManager.getAuthProvider().hasJoined(username, serverId)
        } catch (error) {
            return res.writeStatus(400)
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
                        signature: App.SocketManager.webServerManager.authlib.keyManager.getSignature(texturesValue), // Ох как же тебя жмыхнуло
                    },
                ],
            })
        )
        res.end()
    }
}
