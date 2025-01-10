import { AuthResponseData } from "@aurora-launcher/core";
import { LauncherServerConfig } from "@root/components/config/utils/LauncherServerConfig";
import { SkinManager } from "../../skin/SkinManager";

export interface AuthProviderConstructor {
    new (configManager: LauncherServerConfig, skinManager: SkinManager): AuthProvider;
}

export interface AuthProvider {
    auth(username: string, password: string): PromiseOr<AuthResponseData>;

    join(accessToken: string, userUUID: string, serverID: string): PromiseOr<boolean>;

    hasJoined(username: string, serverID: string): PromiseOr<HasJoinedResponseData>;

    profile(userUUID: string): PromiseOr<ProfileResponseData>;

    profiles(usernames: string[]): PromiseOr<ProfilesResponseData[]>;
}

export class AuthProviderConfig {
    type: string;

    static getDefaultConfig(): AuthProviderConfig {
        return { type: "accept" };
    }
}

export interface HasJoinedResponseData {
    userUUID: string;
    isAlex?: string;
    skinUrl?: string;
    capeUrl?: string;
}

export interface ProfileResponseData {
    username: string;
    isAlex?: string;
    skinUrl?: string;
    capeUrl?: string;
}

export interface ProfilesResponseData {
    id: string;
    name: string;
}
