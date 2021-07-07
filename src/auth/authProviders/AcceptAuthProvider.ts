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

import { App } from "@root/LauncherServer"
import { v4, v5 } from "uuid"

import { AbstractAuthProvider, AuthResponseData, PrivilegesResponseData } from "./AbstractAuthProvider"

export class AcceptAuthProvider extends AbstractAuthProvider {
    static type = "accept"

    sessionsDB: Map<string, UserData> = new Map()

    auth(username: string): AuthResponseData {
        const data = {
            username,
            userUUID: v5(username, App.ConfigManager.getConfig().projectID),
            accessToken: v4(),
        }

        this.sessionsDB.set(data.username, {
            ...data,
            serverId: undefined,
        })

        return data
    }

    join(accessToken: string, userUUID: string, serverId: string): void {
        const user = Array.from(this.sessionsDB.values()).find(
            (e) => e.accessToken === accessToken && e.userUUID === userUUID
        )
        if (user === undefined) throw Error("user nf")

        user.serverId = serverId
        this.sessionsDB.set(user.username, user)
    }

    hasJoined(username: string, serverId: string): UserData {
        if (!this.sessionsDB.has(username)) throw Error("user nf")
        const user = this.sessionsDB.get(username)

        if (user.serverId !== serverId) throw Error("invalid serverId")
        return user
    }

    profile(userUUID: string): UserData {
        const user = Array.from(this.sessionsDB.values()).find((e) => e.userUUID === userUUID)
        if (user === undefined) throw Error("user nf")
        return user
    }

    privileges(): PrivilegesResponseData {
        return {
            onlineChat: true,
            multiplayerServer: true,
            multiplayerRealms: true,
            telemetry: true,
        }
    }

    profiles(userUUIDs: string[]): any {
        return Array.from(this.sessionsDB.values()).filter((e) => userUUIDs.includes(e.userUUID))
    }
}

interface UserData {
    username: string
    userUUID: string
    accessToken: string
    serverId: string
}
