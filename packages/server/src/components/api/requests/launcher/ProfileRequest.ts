import { PROFILE_METHOD } from "@aurora-launcher/core";
import { Service } from "@freshgum/typedi";
import { FastifyRequest } from "fastify";

import { ProfilesManager } from "../../../profiles";
import { AbstractRequest } from "../AbstractRequest";

@Service([])
export class ProfileRequest implements AbstractRequest {
    method = "post";
    url = PROFILE_METHOD;
    schema = {
        body: {
            type: "object",
            properties: {
                uuid: { type: "string" },
            },
        },
    };

    constructor(private profilesManager: ProfilesManager) {}

    handler(req: FastifyRequest<{ Body: { uuid: string } }>) {
        return this.profilesManager
            .getProfiles()
            .find((p) => p.uuid === req.body.uuid)
            ?.toObject();
    }
}
