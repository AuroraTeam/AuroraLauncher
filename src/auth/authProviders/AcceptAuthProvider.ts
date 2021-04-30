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

import { v4, v5 } from "uuid"

import { AbstractAuthProvider, AuthResponseData } from "./AbstractAuthProvider"

export class AcceptAuthProvider extends AbstractAuthProvider {
    static type = "accept"

    sessionsDB: Map<string, UserData> = new Map()

    auth(username: string): AuthResponseData {
        const data = {
            username,
            userUUID: v5(username, "814f98b5-f66d-4456-87dc-f4eed8f6ca73"),
            accessToken: v4(),
        }

        this.sessionsDB.set(data.username, {
            ...data,
            serverID: undefined,
        })

        return data
    }

    join(accessToken: string, userUUID: string, serverID: string): void {
        const user = Array.from(this.sessionsDB.values()).find(
            (e) => e.accessToken === accessToken && e.userUUID === userUUID
        )
        if (user === undefined) throw Error("user nf")

        user.serverID = serverID
        this.sessionsDB.set(user.username, user)
    }

    hasJoined(username: string, serverID: string): { userUUID: string } {
        if (!this.sessionsDB.has(username)) throw Error("user nf")
        const user = this.sessionsDB.get(username)

        if (user.serverID !== serverID) throw Error("invalid serverID")
        return user
    }

    profile(userUUID: string): any {
        const user = Array.from(this.sessionsDB.values()).find((e) => e.userUUID === userUUID)
        if (user === undefined) throw Error("user nf")
        return user
    }
}

interface UserData {
    username: string
    userUUID: string
    accessToken: string
    serverID: string
}
