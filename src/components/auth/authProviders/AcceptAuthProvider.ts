import { UUIDHelper } from "@root/utils"
import {
    AbstractAuthProvider,
    AuthResponseData,
    PrivilegesResponseData,
    ProfilesResponseData,
} from "@root/utils"
import { v4, v5 } from "uuid"

export class AcceptAuthProvider extends AbstractAuthProvider {
    protected static readonly type = "accept"

    private sessionsDB: UserData[] = []

    auth(username: string): AuthResponseData {
        const data = {
            username,
            userUUID: UUIDHelper.getWithoutDashes(
                v5(username, this.configManager.config.projectID)
            ),
            accessToken: UUIDHelper.getWithoutDashes(v4()),
        }

        const userIndex = this.sessionsDB.findIndex(
            (user) => user.username === username
        )
        if (userIndex) {
            this.sessionsDB.splice(userIndex, 1)
        }

        this.sessionsDB.push({
            ...data,
            serverId: undefined,
        })

        return data
    }

    join(accessToken: string, userUUID: string, serverId: string): boolean {
        const user = this.sessionsDB.find(
            (user) =>
                user.accessToken === accessToken && user.userUUID === userUUID
        )
        if (!user) return false

        user.serverId = serverId
        return true
    }

    hasJoined(username: string, serverId: string): UserData {
        const user = this.sessionsDB.find((user) => user.username === username)
        if (!user) throw Error("User not found")

        if (user.serverId !== serverId) throw Error("Invalid serverId")
        return user
    }

    profile(userUUID: string): UserData {
        const user = this.sessionsDB.find((e) => e.userUUID === userUUID)
        if (!user) throw Error("User not found")
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
        return this.sessionsDB
            .filter((user) => userUUIDs.includes(user.userUUID))
            .map((user) => ({
                id: user.userUUID,
                name: user.username,
            }))
    }
}

interface UserData {
    username: string
    userUUID: string
    accessToken: string
    serverId: string
}
