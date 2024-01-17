import { randomUUID } from "crypto";

import { AuthResponseData } from "@aurora-launcher/core";
import { LauncherServerConfig } from "@root/components/config/utils/LauncherServerConfig";
import { UUIDHelper } from "@root/utils";
import { v5 } from "uuid";

import { AuthProvider, ProfilesResponseData } from "./AuthProvider";

export class AcceptAuthProvider implements AuthProvider {
    private projectID: string;
    private sessionsDB: UserData[] = [];

    constructor({ projectID }: LauncherServerConfig) {
        this.projectID = projectID;
    }

    auth(username: string): AuthResponseData {
        const data = {
            username,
            userUUID: UUIDHelper.getWithoutDashes(v5(username, this.projectID)),
            accessToken: UUIDHelper.getWithoutDashes(randomUUID()),
        };

        const userIndex = this.sessionsDB.findIndex((user) => user.username === username);
        if (userIndex !== -1) {
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
            (user) => user.accessToken === accessToken && user.userUUID === userUUID,
        );
        if (!user) return false;

        user.serverId = serverId;
        return true;
    }

    hasJoined(username: string, serverId: string): UserData {
        const user = this.sessionsDB.find((user) => user.username === username);
        if (!user) throw new Error("User not found");

        if (user.serverId !== serverId) {
            throw new Error("Invalid serverId");
        }
        return user;
    }

    profile(userUUID: string): UserData {
        const user = this.sessionsDB.find((e) => e.userUUID === userUUID);
        if (!user) throw new Error("User not found");
        return user;
    }

    profiles(usernames: string[]): ProfilesResponseData[] {
        return this.sessionsDB
            .filter(({ username }) => usernames.includes(username))
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
