import { SERVERS_METHOD, Server } from "@aurora-launcher/core";
import { Service } from "@freshgum/typedi";

import { ProfilesManager } from "../../../profiles";
import { AbstractRequest } from "../AbstractRequest";

@Service([ProfilesManager])
export class ServersRequest implements AbstractRequest {
    method = "get";
    url = SERVERS_METHOD;

    constructor(private profilesManager: ProfilesManager) {}

    handler() {
        const servers: Server[] = [];

        this.profilesManager
            .getProfiles()
            .sort((a, b) => a.sortIndex - b.sortIndex)
            .forEach((profile) => {
                profile.servers.forEach((server) => {
                    servers.push({
                        ...server,
                        profileUUID: profile.uuid,
                    });
                });
            });

        return servers;
    }
}
