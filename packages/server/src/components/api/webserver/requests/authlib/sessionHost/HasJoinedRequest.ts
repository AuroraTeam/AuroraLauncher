import type { AuthProvider } from "@root/components/auth/providers";
import { AuthlibManager } from "@root/components/authlib";
import { Inject, Service } from "typedi";

import { WebRequest } from "../../../WebRequest";
import { WebResponse } from "../../../WebResponse";
import { AbstractRequest } from "../../AbstractRequest";
import { JsonHelper } from "@aurora-launcher/core";

@Service()
export class HasJoinedWebRequest extends AbstractRequest {
    method = "GET";
    url = /^\/authlib\/sessionserver\/session\/minecraft\/hasJoined/;

    constructor(
        @Inject("AuthProvider") private authProvider: AuthProvider,
        private authlibManager: AuthlibManager,
    ) {
        super();
    }

    async emit(req: WebRequest, res: WebResponse): Promise<void> {
        const { username, serverId } = req.query;

        if (this.isInvalidValue(username) || this.isInvalidValue(serverId)) {
            return res.error(400, "BadRequestException", "Empty values are not allowed.");
        }

        let user;
        try {
            user = await this.authProvider.hasJoined(username, serverId);
        } catch (error) {
            return res.error(400, error.message);
        }

        const textures: any = {};
        if (user.skinUrl?.length > 0) {
            textures.SKIN = {
                url: user.skinUrl,
            };
            if (user.isAlex) {
                textures.SKIN.metadata = {
                    model: "slim",
                };
            }
        }
        if (user.capeUrl?.length > 0) {
            textures.CAPE = {
                url: user.capeUrl,
            };
        }

        const texturesValue = Buffer.from(
            JsonHelper.toJson({
                timestamp: Date.now(),
                profileId: user.userUUID,
                profileName: username,
                signatureRequired: true,
                textures,
            }),
        ).toString("base64");

        res.json({
            id: user.userUUID,
            name: username,
            properties: [
                {
                    name: "textures",
                    value: texturesValue,
                    signature: this.authlibManager.getSignature(texturesValue),
                },
            ],
        });
    }
}
