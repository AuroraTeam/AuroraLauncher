import { JsonHelper } from "@aurora-launcher/core";
import { Service } from "@freshgum/typedi";
import type { AuthProvider } from "@root/components/auth/providers";
import { AuthlibManager } from "@root/components/authlib";
import { FastifyReply, FastifyRequest } from "fastify";

import { AuthProviderToken } from "../../../../../tokens";
import { AbstractRequest } from "../../AbstractRequest";

@Service([AuthProviderToken, AuthlibManager])
export class HasJoinedRequest implements AbstractRequest {
    method = "get";
    url = "/authlib/sessionserver/session/minecraft/hasJoined";
    schema = {
        querystring: {
            type: "object",
            properties: {
                username: { type: "string" },
                serverId: { type: "string" },
            },
        },
    };

    constructor(
        private authProvider: AuthProvider,
        private authlibManager: AuthlibManager,
    ) {}

    async handler(
        req: FastifyRequest<{ Querystring: { username: string; serverId: string } }>,
        rep: FastifyReply,
    ) {
        const { username, serverId } = req.query;

        if (!username || !serverId) {
            rep.status(400);
            return {
                error: "BadRequestException",
                errorMessage: "Empty values are not allowed",
            };
        }

        let user;
        try {
            user = await this.authProvider.hasJoined(username, serverId);
        } catch (error) {
            rep.status(400);
            return {
                error: "ForbiddenOperationException",
                errorMessage: error.message,
            };
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

        return {
            id: user.userUUID,
            name: username,
            properties: [
                {
                    name: "textures",
                    value: texturesValue,
                    signature: this.authlibManager.getSignature(texturesValue),
                },
            ],
        };
    }
}
