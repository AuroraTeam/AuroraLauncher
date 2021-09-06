import { IncomingMessage, ServerResponse } from "http"

import { HttpHelper } from "@root/helpers/HttpHelper"
import { App } from "@root/LauncherServer"

import { AbstractRequest } from "../../AbstractRequest"

export class ProfileRequest extends AbstractRequest {
    method = "GET"
    url = /^\/authlib\/session\/minecraft\/profile\/(?<uuid>\w{32})(\?unsigned=(true|false))?$/

    async emit(req: IncomingMessage, res: ServerResponse): Promise<void> {
        const matches = req.url.match(this.url)
        const uuid = matches.groups.uuid
        const signed = matches[3] === "false"

        let user
        try {
            user = await App.AuthManager.getAuthProvider().profile(uuid)
        } catch (error) {
            res.statusCode = 204
            return res.end()
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
        if (signed) data.properties[0].signature = App.AuthlibManager.getSignature(texturesValue)
        HttpHelper.sendJson(res, data)
    }
}
