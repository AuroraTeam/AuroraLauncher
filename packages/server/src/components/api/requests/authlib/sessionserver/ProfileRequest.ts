import { Service } from "@freshgum/typedi";
import { AuthProvider } from "@root/components/auth/providers/AuthProvider";
import { AuthlibManager } from "@root/components/authlib/AuthlibManager";
import { UUIDHelper } from "@root/helpers";
import { FastifyReply, FastifyRequest } from "fastify";

import { AuthProviderToken } from "../../../../../tokens";
import { AbstractRequest } from "../../AbstractRequest";

@Service([AuthProviderToken, AuthlibManager])
export class ProfileRequest implements AbstractRequest {
    method = "get";
    url = "/authlib/sessionserver/session/minecraft/profile/:uuid";
    schema = {
        params: {
            type: "object",
            required: ["uuid"],
            properties: {
                uuid: { type: "string" },
            },
        },
        querystring: {
            type: "object",
            properties: {
                unsigned: { type: "boolean", default: true },
            },
        },
    };

    constructor(
        private authProvider: AuthProvider,
        private authlibManager: AuthlibManager,
    ) {}

    async handler(
        req: FastifyRequest<{ Params: { uuid: string }; Querystring: { unsigned: boolean } }>,
        rep: FastifyReply,
    ) {
        const uuid = req.params.uuid;
        const signed = req.query.unsigned === false;

        let user;
        try {
            user = await this.authProvider.profile(UUIDHelper.getWithDashes(uuid));
        } catch {
            rep.code(204);
            return;
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

        let texturesValue: any = {
            timestamp: Date.now(),
            profileId: uuid,
            profileName: user.username,
            textures,
        };

        const data: any = {
            id: uuid,
            name: user.username,
            properties: [
                {
                    name: "textures",
                    value: "",
                },
            ],
        };

        if (signed) texturesValue.signatureRequired = true;
        texturesValue = Buffer.from(JSON.stringify(texturesValue));
        data.properties[0].value = texturesValue.toString("base64");
        if (signed) data.properties[0].signature = this.authlibManager.getSignature(texturesValue);
        return data;
    }
}
