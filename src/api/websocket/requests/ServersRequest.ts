import { App } from "@root/LauncherServer"
import { AbstractRequest, ResponseResult } from "aurora-rpc-server"

export class ServersRequest extends AbstractRequest {
    method = "servers"

   /**
    * It returns a list of servers.
    * @returns An array of objects.
    */
    invoke(): ResponseResult {
        const servers: any[] = []
        App.ProfilesManager.profiles
            .sort((a, b) => a.sortIndex - b.sortIndex)
            .forEach((p) => {
                p.servers.forEach((s) => {
                    servers.push({
                        ip: s.ip,
                        port: s.port,
                        title: s.title,
                        profileUUID: p.uuid,
                    })
                })
            })

        return servers
    }
}
