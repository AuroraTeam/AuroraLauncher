import { Service } from "@freshgum/typedi";
import { FastifyRequest } from "fastify";

import { AuthProviderToken } from "../../../../../tokens";
import { AuthProvider, InvalidateRequestData } from "../../../../auth/providers/AuthProvider";
import { AbstractRequest } from "../../AbstractRequest";

@Service([AuthProviderToken])
export class InvalidateRequest implements AbstractRequest {
    method = "post";
    url = "/authlib/authserver/invalidate";
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

    handler(req: FastifyRequest<{ Body: InvalidateRequestData }>) {
        return this.authProvider.invalidate(req.body);
    }
}
