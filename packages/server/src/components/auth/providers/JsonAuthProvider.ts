import { AuthResponseData, HttpHelper } from "@aurora-launcher/core";
import { LauncherServerConfig } from "@root/components/config/utils/LauncherServerConfig";

import {
    AuthProvider,
    AuthProviderConfig,
    HasJoinedResponseData,
    ProfileResponseData,
    ProfilesResponseData,
} from "./AuthProvider";
import { UUIDHelper } from "../../../utils";

export class JsonAuthProvider implements AuthProvider {
    private config: JsonAuthProviderConfig;

    constructor({ auth }: LauncherServerConfig) {
        this.config = <JsonAuthProviderConfig>auth;
    }

    async auth(username: string, password: string): Promise<AuthResponseData> {
        return await HttpHelper.postJson<AuthResponseData>(this.config.authUrl, {
            username,
            password,
        });
    }

    async join(accessToken: string, userUUID: string, serverID: string): Promise<boolean> {
        return await HttpHelper.postJson<boolean>(this.config.joinUrl, {
            accessToken,
            userUUID: UUIDHelper.getWithDashes(userUUID),
            serverID,
        });
    }

    async hasJoined(username: string, serverID: string): Promise<HasJoinedResponseData> {
        return await HttpHelper.postJson<HasJoinedResponseData>(this.config.hasJoinedUrl, {
            username,
            serverID,
        });
    }

    async profile(userUUID: string): Promise<ProfileResponseData> {
        return await HttpHelper.postJson<ProfileResponseData>(this.config.profileUrl, {
            userUUID: UUIDHelper.getWithDashes(userUUID),
        });
    }

    async profiles(usernames: string[]): Promise<ProfilesResponseData[]> {
        return await HttpHelper.postJson<ProfilesResponseData[]>(
            this.config.profilesUrl,
            usernames,
        );
    }
}

export interface JsonAuthProviderConfig extends AuthProviderConfig {
    authUrl: string;
    joinUrl: string;
    hasJoinedUrl: string;
    profileUrl: string;
    profilesUrl: string;
}
