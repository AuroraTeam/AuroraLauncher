import { Service } from "@freshgum/typedi";
import { FastifyReply, FastifyRequest } from "fastify";

import { AuthProviderToken } from "../../../../../tokens";
import { AuthProvider, ValidateRequestData } from "../../../../auth/providers/AuthProvider";
import { AbstractRequest } from "../../AbstractRequest";

@Service([AuthProviderToken])
export class ValidateRequest implements AbstractRequest {
    method = "post";
    url = "/authlib/authserver/validate";
    schema = {
        body: {
            type: "object",
            required: ["accessToken"],
            properties: {
                accessToken: { type: "string" },
                clientToken: { type: "string" },
            },
        },
    };

    constructor(private authProvider: AuthProvider) {}

    async handler(req: FastifyRequest<{ Body: ValidateRequestData }>, rep: FastifyReply) {
        const result = await this.authProvider.validate(req.body);
        if (result) {
            rep.code(204);
        } else {
            rep.code(403);
        }
    }
}
