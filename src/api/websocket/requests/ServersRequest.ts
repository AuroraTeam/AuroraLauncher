/**
 * AuroraLauncher LauncherServer - Server for AuroraLauncher
 * Copyright (C) 2020 - 2021 AuroraTeam

 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.

 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.

 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { App } from "../../../LauncherServer"
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
