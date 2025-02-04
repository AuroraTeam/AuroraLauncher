import { randomUUID } from "crypto";

import { AuthResponseData, HttpHelper, JsonHelper } from "@aurora-launcher/core";
import { LauncherServerConfig } from "@root/components/config/utils/LauncherServerConfig";
import { v5 } from "uuid";

import {
    AuthProvider,
    HasJoinedResponseData,
    ProfileResponseData,
    ProfilesResponseData,
} from "./AuthProvider";
import { MojangTextures, SkinableAuthProvider } from "./SkinableAuthProvider";

export class AcceptAuthProvider implements AuthProvider, SkinableAuthProvider {
    private projectID: string;
    private sessionsDB: UserData[] = [];

    constructor({ projectID }: LauncherServerConfig) {
        this.projectID = projectID;
    }

    async auth(username: string): Promise<AuthResponseData> {
        const userUUID = v5(username, this.projectID);
        const data = {
            username,
            userUUID,
            accessToken: randomUUID(),
            refreshToken: randomUUID(),
        };

        const userIndex = this.sessionsDB.findIndex((user) => user.username === username);
        if (userIndex !== -1) {
            this.sessionsDB.splice(userIndex, 1);
        }

        this.sessionsDB.push({
            ...data,
            serverId: undefined,
        });

        const skinData = await this.getSkinData(username);

        return {
            ...data,
            skinUrl: skinData.SKIN?.url,
            capeUrl: skinData.CAPE?.url,
        };
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

    async getSkinData(username: string) {
        let data: any;

        try {
            data = await HttpHelper.getResourceFromJson<any>(
                "https://api.mojang.com/users/profiles/minecraft/" + username,
            );
        } catch {
            return {};
        }

        try {
            data = await HttpHelper.getResourceFromJson<any>(
                "https://sessionserver.mojang.com/session/minecraft/profile/" + data.id,
            );
        } catch {
            return {};
        }

        if (!data.properties) return {};

        const profile = JsonHelper.fromJson<MojangTextures>(
            Buffer.from(data.properties[0].value, "base64").toString("utf-8"),
        );

        return profile.textures;
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
