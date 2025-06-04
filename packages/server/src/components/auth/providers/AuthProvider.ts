import { AuthResponseData, AuthType } from "@aurora-launcher/core";
import { LauncherServerConfig } from "@root/components/config/utils/LauncherServerConfig";

export interface AuthProviderConstructor {
    new (configManager: LauncherServerConfig): AuthProvider;
}

export interface AuthProvider {
    auth(username: string, password: string): PromiseOr<AuthResponseData>;

    // refresh(): PromiseOr<null>;

    // validate(): PromiseOr<null>;

    // logout(): PromiseOr<null>;

    join(accessToken: string, userUUID: string, serverID: string): PromiseOr<boolean>;

    hasJoined(username: string, serverID: string): PromiseOr<HasJoinedResponseData>;

    profile(userUUID: string): PromiseOr<ProfileResponseData>;

    profiles(usernames: string[]): PromiseOr<ProfilesResponseData[]>;

    getAuthType(): AuthType;
    getExtraAuthData(): any;
}

export class AuthProviderConfig {
    type: string;
    skinDomains?: string[];

    static getDefaultConfig(): AuthProviderConfig {
        return { type: "accept", skinDomains: ["textures.minecraft.net"] };
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
