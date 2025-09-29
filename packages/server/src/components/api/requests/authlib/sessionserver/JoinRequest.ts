import { Service } from "@freshgum/typedi";
import type { AuthProvider } from "@root/components/auth/providers";
import { UUIDHelper } from "@root/utils";
import { FastifyReply, FastifyRequest } from "fastify";

import { AuthProviderToken } from "../../../../../tokens";
import { AbstractRequest } from "../../AbstractRequest";

interface JoinRequestDto {
    accessToken: string;
    selectedProfile: string;
    serverId: string;
}

@Service([AuthProviderToken])
export class JoinRequest implements AbstractRequest {
    method = "post";
    url = "/authlib/sessionserver/session/minecraft/join";
    schema = {
        body: {
            type: "object",
            properties: {
                accessToken: { type: "string" },
                selectedProfile: { type: "string" },
                serverId: { type: "string" },
            },
        },
    };

    constructor(private authProvider: AuthProvider) {}

    async handler(req: FastifyRequest<{ Body: JoinRequestDto }>, rep: FastifyReply) {
        const data = req.body;

        const status = await this.authProvider.join(
            data.accessToken,
            UUIDHelper.getWithDashes(data.selectedProfile),
            data.serverId,
        );

        if (!status) {
            rep.code(400);
            return {
                error: "ForbiddenOperationException",
                errorMessage: "Invalid credentials",
            };
        }

        rep.raw.end();
    }
}
