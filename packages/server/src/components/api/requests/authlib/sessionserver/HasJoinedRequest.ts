import { JsonHelper } from "@aurora-launcher/core";
import { Service } from "@freshgum/typedi";
import { FastifyReply, FastifyRequest } from "fastify";

import { AuthProviderToken } from "../../../../../tokens";
import { AuthProvider } from "../../../../auth/providers/AuthProvider";
import { AuthlibManager } from "../../../../authlib/AuthlibManager";
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
            rep.code(400);
            return {
                error: "BadRequestException",
                errorMessage: "Empty values are not allowed",
            };
        }

        let user;
        try {
            user = await this.authProvider.hasJoined(username, serverId);
        } catch (error) {
            rep.code(400);
            return {
                error: "ForbiddenOperationException",
                errorMessage: (error as Error).message,
            };
        }

        const textures: any = {};
        if (user.skinUrl?.length) {
            textures.SKIN = {
                url: user.skinUrl,
            };
            if (user.isAlex) {
                textures.SKIN.metadata = {
                    model: "slim",
                };
            }
        }
        if (user.capeUrl?.length) {
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
