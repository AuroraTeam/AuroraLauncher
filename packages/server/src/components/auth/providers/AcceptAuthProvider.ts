import { randomUUID } from "crypto";

import { AuthResponseData } from "@aurora-launcher/core";
import { LauncherServerConfig } from "@root/components/config/utils/LauncherServerConfig";
import { UUIDHelper } from "@root/utils";
import { ResponseError } from "aurora-rpc-server";
import { v5 } from "uuid";

import { AuthProvider, PrivilegesResponseData, ProfilesResponseData } from "./AuthProvider";

export class AcceptAuthProvider implements AuthProvider {
    private projectID: string;
    private sessionsDB: UserData[] = [];

    constructor({ projectID }: LauncherServerConfig) {
        this.projectID = projectID;
    }

    auth(username: string): AuthResponseData {
        const data = {
            username,
            userUUID: v5(username, this.projectID),
            accessToken: randomUUID(),
        };

        const userIndex = this.sessionsDB.findIndex((user) => user.username === username);
        if (userIndex) {
            this.sessionsDB.splice(userIndex, 1);
        }

        this.sessionsDB.push({
            ...data,
            serverId: undefined,
        });

        return data;
    }

    join(accessToken: string, userUUID: string, serverId: string): boolean {
        const user = this.sessionsDB.find(
            (user) =>
                user.accessToken === accessToken &&
                user.userUUID === UUIDHelper.getWithDashes(userUUID)
        );
        if (!user) return false;

        user.serverId = serverId;
        return true;
    }

    hasJoined(username: string, serverId: string): UserData {
        const user = this.sessionsDB.find((user) => user.username === username);
        if (!user) throw new ResponseError("User not found", 100);

        if (user.serverId !== serverId) {
            throw new ResponseError("Invalid serverId", 101);
        }
        return user;
    }

    profile(userUUID: string): UserData {
        const user = this.sessionsDB.find((e) => e.userUUID === userUUID);
        if (!user) throw new ResponseError("User not found", 100);
        return user;
    }

    privileges(): PrivilegesResponseData {
        return {
            onlineChat: true,
            multiplayerServer: true,
            multiplayerRealms: true,
            telemetry: false,
        };
    }

    profiles(userUUIDs: string[]): ProfilesResponseData[] {
        return this.sessionsDB
            .filter(({ userUUID }) => userUUIDs.includes(userUUID))
            .map((user) => ({
                id: user.userUUID,
                name: user.username,
            }));
    }
}

interface UserData {
    username: string;
    userUUID: string;
    accessToken: string;
    serverId: string;
}
