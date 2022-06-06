import { App } from "@root/LauncherServer"

import { ResponseData } from "../types/Response"
import { AbstractRequest } from "./AbstractRequest"

export class ServersRequest extends AbstractRequest {
    type = "servers"

    invoke(): ResponseData {
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

        return {
            servers,
        }
    }
}
