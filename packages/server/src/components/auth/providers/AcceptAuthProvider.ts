import { randomUUID } from "crypto";

import { AuthResponseData } from "@aurora-launcher/core";
import { LauncherServerConfig } from "@root/components/config/utils/LauncherServerConfig";
import { SkinManager } from "../../skin";
import { v5 } from "uuid";

import {
    AuthProvider,
    HasJoinedResponseData,
    ProfileResponseData,
    ProfilesResponseData,
} from "./AuthProvider";

export class AcceptAuthProvider implements AuthProvider {
    private projectID: string;
    private skinManager: SkinManager;
    private sessionsDB: UserData[] = [];

    constructor({ projectID }: LauncherServerConfig, skinManager: SkinManager) {
        this.projectID = projectID;
        this.skinManager = skinManager;
    }

    auth(username: string): AuthResponseData {
        
        const userUUID = v5(username, this.projectID)
        const data = {
            username,
            userUUID,
            accessToken: randomUUID(),
            skinUrl: this.skinManager.getSkin(userUUID, username),
            capeUrl: this.skinManager.getCape(userUUID, username),
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

    hasJoined(username: string, serverId: string): HasJoinedResponseData {
        const user = this.sessionsDB.find((user) => user.username === username);
        if (!user) throw new Error("User not found");

        if (user.serverId !== serverId) {
            throw new Error("Invalid serverId");
        }
        return user;
    }

    profile(userUUID: string): ProfileResponseData {
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
    skinUrl?: string;
    capeUrl?: string;
}
