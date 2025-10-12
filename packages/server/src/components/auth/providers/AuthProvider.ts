import { LauncherServerConfig } from "../../config/utils/LauncherServerConfig";

export interface AuthProviderConstructor {
    new (configManager: LauncherServerConfig): AuthProvider;
}

export interface AuthProvider {
    authenticate(payload: AuthenticateRequestData): PromiseOr<AuthenticateResponseData>;

    refresh(payload: RefreshRequestData): PromiseOr<RefreshResponseData>;

    validate(payload: ValidateRequestData): PromiseOr<boolean>;

    invalidate(payload: InvalidateRequestData): PromiseOr<void>;

    join(accessToken: string, userUUID: string, serverID: string): PromiseOr<boolean>;

    hasJoined(username: string, serverID: string): PromiseOr<HasJoinedResponseData>;

    profile(userUUID: string): PromiseOr<ProfileResponseData>;

    profiles(usernames: string[]): PromiseOr<ProfilesResponseData[]>;
}

export interface AuthProviderConfig {
    type: string;
    skinDomains?: string[];
}

export interface AuthenticateRequestData {
    username: string;
    password: string;
    clientToken?: string;
}

export interface AuthenticateResponseData {
    accessToken: string;
    clientToken: string;
    selectedProfile: {
        id: string;
        name: string;
    };
}

export interface RefreshRequestData {
    accessToken: string;
    clientToken?: string;
}

export type RefreshResponseData = AuthenticateResponseData;

export type ValidateRequestData = RefreshRequestData;

export type InvalidateRequestData = RefreshRequestData;

export interface HasJoinedResponseData {
    userUUID: string;
    isAlex?: boolean;
    skinUrl?: string;
    capeUrl?: string;
}

export interface ProfileResponseData {
    username: string;
    isAlex?: boolean;
    skinUrl?: string;
    capeUrl?: string;
}

export interface ProfilesResponseData {
    id: string;
    name: string;
}
