import { Service } from "@freshgum/typedi";
import { AuthProvider } from "@root/components/auth/providers/AuthProvider";
import { FastifyReply, FastifyRequest } from "fastify";

import { AbstractRequest } from "../../AbstractRequest";

@Service([])
export class ProfilesRequest implements AbstractRequest {
    method = "post";
    url = "/authlib/api/profiles/minecraft";

    constructor(private authProvider: AuthProvider) {}

    handler(req: FastifyRequest, rep: FastifyReply) {
        const data = <string[] | undefined>req.body;
        if (!data) {
            rep.status(400);
            return {
                error: "CONSTRAINT_VIOLATION",
                errorMessage: "size must be between 1 and 10",
            };
        }

        if (data.length < 1 || data.length > 10) {
            rep.status(400);
            return {
                error: "CONSTRAINT_VIOLATION",
                errorMessage: "size must be between 1 and 10",
            };
        }

        return this.authProvider.profiles(data);
    }
}
