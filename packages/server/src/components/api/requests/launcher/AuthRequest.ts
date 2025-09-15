import { AUTH_METHOD } from "@aurora-launcher/core";
import { Service } from "@freshgum/typedi";
import { FastifyRequest } from "fastify";

import { AuthProvider } from "../../../auth";
import { AbstractRequest } from "../AbstractRequest";

@Service([])
export class AuthRequest implements AbstractRequest {
    method = "post";
    url = AUTH_METHOD;
    schema: {
        body: {
            type: "object";
            properties: {
                login: { type: "string" };
                password: { type: "string" };
            };
        };
    };

    constructor(private authProvider: AuthProvider) {}

    handler(req: FastifyRequest<{ Body: { login: string; password: string } }>) {
        const data = req.body;

        this.authProvider.auth(data.login, data.password);
    }
}
