import { IncomingMessage } from "http"

import { JsonHelper } from "../../../helpers/JsonHelper"
import UUIDHelper from "../../../helpers/UUIDHelper"
import { App } from "../../../LauncherServer"
import { CustomServerResponse } from "../AuthlibManager"
import { AuthlibRequest } from "../AuthlibRequest"

export class ProfileRequest extends AuthlibRequest {
    method = "GET"
    url = /^\/session\/minecraft\/profile\/(?<uuid>\w{32})(\?unsigned=(true|false))?$/

    async emit(_req: IncomingMessage, res: CustomServerResponse, url: string): Promise<void> {
        const matches = url.match(this.url)
        const uuid = matches.groups.uuid
        const signed = matches[3] === "false"

        let user
        try {
            user = await App.AuthManager.getAuthProvider().profile(UUIDHelper.getWithDashes(uuid))
        } catch (error) {
            return res.writeStatus(400)
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

        let texturesValue: any = {
            timestamp: Date.now(),
            profileId: uuid,
            profileName: user.username,
            textures,
        }

        const data: any = {
            id: uuid,
            name: user.username,
            properties: [
                {
                    name: "textures",
                    value: "",
                },
            ],
        }

        if (signed) texturesValue.signatureRequired = true
        texturesValue = Buffer.from(JSON.stringify(texturesValue))
        data.properties[0].value = texturesValue.toString("base64")
        if (signed)
            data.properties[0].signature =
                App.SocketManager.webServerManager.authlib.keyManager.getSignature(texturesValue)
        res.write(JsonHelper.toJSON(data))
        res.end()
    }
}
