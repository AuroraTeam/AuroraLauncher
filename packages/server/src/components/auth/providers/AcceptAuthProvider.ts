import { randomUUID } from "crypto";

import { HttpHelper, JsonHelper } from "@aurora-launcher/core";
import { Service } from "@freshgum/typedi";
import { LauncherServerConfig } from "@root/components/config/utils/LauncherServerConfig";
import { v5 } from "uuid";

import {
    AuthProvider,
    AuthenticateRequestData,
    InvalidateRequestData,
    RefreshRequestData,
    ValidateRequestData,
} from "./AuthProvider";
import { MojangTextures, SkinableAuthProvider } from "./SkinableAuthProvider";

@Service([])
export class AcceptAuthProvider implements AuthProvider, SkinableAuthProvider {
    private projectID: string;
    private sessionsDB: UserData[] = [];

    constructor({ projectID }: LauncherServerConfig) {
        this.projectID = projectID;
    }

    async authenticate({ username, clientToken }: AuthenticateRequestData) {
        const userUUID = v5(username, this.projectID);
        const accessToken = randomUUID(); // TODO: generate access token (JWT)
        clientToken ||= randomUUID();

        this.sessionsDB = this.sessionsDB.filter((user) => user.username !== username);

        const skinData = await this.getSkinData(username);

        this.sessionsDB.push({
            username,
            userUUID,
            accessToken,
            clientToken,
            skinUrl: skinData.SKIN?.url,
            capeUrl: skinData.CAPE?.url,
            isAlex: skinData.SKIN?.metadata?.model === "slim",
        });

        return {
            accessToken,
            clientToken,
            selectedProfile: {
                id: userUUID,
                name: username,
            },
        };
    }

    refresh({ accessToken, clientToken }: RefreshRequestData) {
        const user = this.sessionsDB.find((user) =>
            this.userMatch(user, { accessToken, clientToken }),
        );
        if (!user) throw new Error("User not found");

        user.accessToken = randomUUID(); // TODO: generate access token (JWT)

        return {
            accessToken: user.accessToken,
            clientToken: user.clientToken,
            selectedProfile: {
                id: user.userUUID,
                name: user.username,
            },
        };
    }

    validate({ accessToken, clientToken }: ValidateRequestData) {
        return this.sessionsDB.some((user) => this.userMatch(user, { accessToken, clientToken }));
    }

    invalidate({ accessToken, clientToken }: InvalidateRequestData) {
        this.sessionsDB = this.sessionsDB.filter((user) =>
            this.userMatch(user, { accessToken, clientToken }),
        );
    }

    join(accessToken: string, userUUID: string, serverId: string) {
        const user = this.sessionsDB.find(
            (user) => user.accessToken === accessToken && user.userUUID === userUUID,
        );
        if (!user) return false;

        user.serverId = serverId;
        return true;
    }

    hasJoined(username: string, serverId: string) {
        const user = this.sessionsDB.find((user) => user.username === username);
        if (!user) throw new Error("User not found");

        if (user.serverId !== serverId) {
            throw new Error("Invalid serverId");
        }
        return user;
    }

    profile(userUUID: string) {
        const user = this.sessionsDB.find((e) => e.userUUID === userUUID);
        if (!user) throw new Error("User not found");
        return user;
    }

    profiles(usernames: string[]) {
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

    private userMatch(
        user: UserData,
        { accessToken, clientToken }: { accessToken: string; clientToken?: string },
    ) {
        if (clientToken) {
            return user.clientToken === clientToken && user.accessToken === accessToken;
        }
        return user.accessToken === accessToken;
    }
}

interface UserData {
    username: string;
    userUUID: string;
    accessToken: string;
    clientToken: string;
    serverId?: string;
    skinUrl?: string;
    capeUrl?: string;
    isAlex?: boolean;
}
