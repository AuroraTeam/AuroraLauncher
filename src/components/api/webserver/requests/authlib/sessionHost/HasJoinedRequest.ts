import { AuthManager } from "@root/components/auth"
import { AuthlibManager } from "@root/components/authlib"
import { JsonHelper } from "@root/utils"
import { injectable } from "tsyringe"

import { WebRequest } from "../../../WebRequest"
import { WebResponse } from "../../../WebResponse"
import { AbstractRequest } from "../../AbstractRequest"

@injectable()
export class HasJoinedRequest extends AbstractRequest {
    method = "GET"
    url = /^\/authlib\/sessionserver\/session\/minecraft\/hasJoined/

    constructor(
        private authManager: AuthManager,
        private authlibManager: AuthlibManager
    ) {
        super()
    }

    async emit(req: WebRequest, res: WebResponse): Promise<void> {
        const { username, serverId } = req.query

        if (this.isInvalidValue(username) || this.isInvalidValue(serverId))
            return res.sendError()

        let user
        try {
            user = await this.authManager
                .getAuthProvider()
                .hasJoined(username, serverId)
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
                    signature: this.authlibManager.getSignature(texturesValue),
                },
            ],
        })
    }
}
