import { App } from "@root/LauncherServer"
import { UUIDHelper } from "@root/utils"
import {
    AbstractAuthProvider,
    AuthResponseData,
    PrivilegesResponseData,
    ProfilesResponseData,
} from "@root/utils"
import { v4, v5 } from "uuid"

export class AcceptAuthProvider extends AbstractAuthProvider {
    static type = "accept"

    sessionsDB: Map<string, UserData> = new Map()

    auth(username: string): AuthResponseData {
        const data = {
            username,
            userUUID: UUIDHelper.getWithoutDashes(
                v5(username, App.ConfigManager.config.projectID)
            ),
            accessToken: UUIDHelper.getWithoutDashes(v4()),
        }

        this.sessionsDB.set(data.username, {
            ...data,
            serverId: undefined,
        })

        return data
    }

    join(accessToken: string, userUUID: string, serverId: string): boolean {
        const user = Array.from(this.sessionsDB.values()).find(
            (e) => e.accessToken === accessToken && e.userUUID === userUUID
        )
        if (user === undefined) return false

        user.serverId = serverId
        this.sessionsDB.set(user.username, user)
        return true
    }

    hasJoined(username: string, serverID: string): UserData {
        if (!this.sessionsDB.has(username)) throw Error("User not found")
        const user = this.sessionsDB.get(username)

        if (user.serverId !== serverID) throw Error("Invalid serverId")
        return user
    }

    profile(userUUID: string): UserData {
        const user = Array.from(this.sessionsDB.values()).find(
            (e) => e.userUUID === userUUID
        )
        if (user === undefined) throw Error("User not found")
        return user
    }

    privileges(): PrivilegesResponseData {
        return {
            onlineChat: true,
            multiplayerServer: true,
            multiplayerRealms: true,
            telemetry: false,
        }
    }

    profiles(userUUIDs: string[]): ProfilesResponseData[] {
        return Array.from(this.sessionsDB.values())
            .filter((e) => userUUIDs.includes(e.userUUID))
            .map((usr) => ({
                id: usr.userUUID,
                name: usr.username,
            }))
    }
}

interface UserData {
    username: string
    userUUID: string
    accessToken: string
    serverId: string
}
