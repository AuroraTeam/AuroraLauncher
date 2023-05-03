import { LauncherServerConfig } from "@root/components/config/utils/LauncherServerConfig";

export interface AuthProviderConstructor {
    new (configManager: LauncherServerConfig): AuthProvider;
}

export interface AuthProvider {
    auth(
        username: string,
        password: string
    ): PromiseOr<AuthResponseData | void>;

    join(
        accessToken: string,
        userUUID: string,
        serverID: string
    ): PromiseOr<boolean | void>;

    hasJoined(
        username: string,
        serverID: string
    ): PromiseOr<HasJoinedResponseData | void>;

    profile(userUUID: string): PromiseOr<ProfileResponseData | void>;

    privileges(accessToken: string): PromiseOr<PrivilegesResponseData | void>;

    profiles(userUUIDs: string[]): PromiseOr<ProfilesResponseData[] | void>;
}

export class AuthProviderConfig {
    type: string;

    static getDefaultConfig(): AuthProviderConfig {
        return { type: "accept" };
    }
}

export interface AuthResponseData {
    username: string;
    userUUID: string;
    accessToken: string;
}

export interface HasJoinedResponseData {
    userUUID: string;
    skinUrl?: string;
    capeUrl?: string;
}

export interface ProfileResponseData {
    username: string;
    skinUrl?: string;
    capeUrl?: string;
}

export interface PrivilegesResponseData {
    onlineChat: boolean;
    multiplayerServer: boolean;
    multiplayerRealms: boolean;
    telemetry: boolean;
}

export interface ProfilesResponseData {
    id: string;
    name: string;
}
