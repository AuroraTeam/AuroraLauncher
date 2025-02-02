import { Server, ServersResponseData } from "@aurora-launcher/core";
import { AbstractRequest } from "@aurora-rpc/server";
import { ProfilesManager } from "@root/components/profiles";
import { Service } from "typedi";

@Service()
export class ServersWsRequest extends AbstractRequest {
    method = "servers";

    constructor(private profilesManager: ProfilesManager) {
        super();
    }

    /**
     * It returns a list of servers.
     * @returns An array of objects.
     */
    invoke(): ServersResponseData {
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
