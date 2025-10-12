import { Service } from "@freshgum/typedi";
import { UUIDHelper } from "@root/helpers";
import { FastifyReply, FastifyRequest } from "fastify";

import { AuthProviderToken } from "../../../../../tokens";
import { AuthProvider } from "../../../../auth/providers/AuthProvider";
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

        return;
    }
}
