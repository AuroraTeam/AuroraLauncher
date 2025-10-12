import { Service } from "@freshgum/typedi";
import { FastifyRequest } from "fastify";

import { AuthProviderToken } from "../../../../../tokens";
import { AuthProvider, AuthenticateRequestData } from "../../../../auth/providers/AuthProvider";
import { AbstractRequest } from "../../AbstractRequest";

@Service([AuthProviderToken])
export class AuthenticateRequest implements AbstractRequest {
    method = "post";
    url = "/authlib/authserver/authenticate";
    schema = {
        body: {
            type: "object",
            required: ["username", "password"],
            properties: {
                username: { type: "string" },
                password: { type: "string" },
                clientToken: { type: "string" },
            },
        },
    };

    constructor(private authProvider: AuthProvider) {}

    handler(req: FastifyRequest<{ Body: AuthenticateRequestData }>) {
        return this.authProvider.authenticate(req.body);
    }
}
