import { PROFILE_METHOD, ProfileRequestData, ProfileResponseData } from "@aurora-launcher/core";
import { Service } from "@freshgum/typedi";
import { FastifyRequest } from "fastify";

import { ProfilesManager } from "../../../profiles/ProfilesManager";
import { AbstractRequest } from "../AbstractRequest";

@Service([ProfilesManager])
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

    handler(req: FastifyRequest<{ Body: ProfileRequestData }>): ProfileResponseData {
        const profile = this.profilesManager.getProfiles().find((p) => p.uuid === req.body.uuid);

        if (!profile) {
            throw new Error("Profile not found");
        }

        return profile.toObject();
    }
}
