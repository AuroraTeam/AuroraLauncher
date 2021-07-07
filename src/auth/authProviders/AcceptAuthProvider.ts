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
