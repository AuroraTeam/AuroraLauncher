import { Service } from "@freshgum/typedi";
import { FastifyRequest } from "fastify";

import { AuthProviderToken } from "../../../../../tokens";
import { AuthProvider, RefreshRequestData } from "../../../../auth/providers/AuthProvider";
import { AbstractRequest } from "../../AbstractRequest";

@Service([AuthProviderToken])
export class RefreshRequest implements AbstractRequest {
    method = "post";
    url = "/authlib/authserver/refresh";
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

    handler(req: FastifyRequest<{ Body: RefreshRequestData }>) {
        return this.authProvider.refresh(req.body);
    }
}
