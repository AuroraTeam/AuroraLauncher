import { ProfilesManager } from "@root/components/profiles";
import { AbstractRequest, ResponseResult } from "aurora-rpc-server";
import { injectable } from "tsyringe";

@injectable()
export class ServersRequest extends AbstractRequest {
    method = "servers";

    constructor(private profilesManager: ProfilesManager) {
        super();
    }

    /**
     * It returns a list of servers.
     * @returns An array of objects.
     */
    invoke(): ResponseResult {
        const servers: any[] = [];
        this.profilesManager.profiles
            .sort(
                (a: { sortIndex: number }, b: { sortIndex: number }) =>
                    a.sortIndex - b.sortIndex
            )
            .forEach((p: { servers: any[]; uuid: any }) => {
                p.servers.forEach((s) => {
                    servers.push({
                        ip: s.ip,
                        port: s.port,
                        title: s.title,
                        profileUUID: p.uuid,
                    });
                });
            });

        return servers;
    }
}
