import { HttpHelper } from "@aurora-launcher/core";
import { LauncherServerConfig } from "@root/components/config/utils/LauncherServerConfig";

import {
    AuthProvider,
    AuthProviderConfig,
    AuthenticateRequestData,
    AuthenticateResponseData,
    HasJoinedResponseData,
    ProfileResponseData,
    ProfilesResponseData,
} from "./AuthProvider";

export class JsonAuthProvider implements AuthProvider {
    private config: JsonAuthProviderConfig;

    constructor({ auth }: LauncherServerConfig) {
        this.config = <JsonAuthProviderConfig>auth;
    }

    async authenticate(payload: AuthenticateRequestData) {
        try {
            return this.parseResponse(
                await HttpHelper.postJson<ApiResponse<AuthenticateResponseData>>(
                    this.config.authUrl,
                    payload,
                ),
            );
        } catch (error) {
            throw new Error((error as Error).message);
        }
    }

    validate(): never {
        throw new Error();
    }

    refresh(): never {
        throw new Error();
    }

    invalidate(): never {
        throw new Error();
    }

    async join(accessToken: string, userUUID: string, serverID: string): Promise<boolean> {
        return this.parseResponse(
            await HttpHelper.postJson<ApiResponse<boolean>>(this.config.joinUrl, {
                accessToken,
                userUUID,
                serverID,
            }),
        );
    }

    async hasJoined(username: string, serverID: string): Promise<HasJoinedResponseData> {
        return this.parseResponse(
            await HttpHelper.postJson<ApiResponse<HasJoinedResponseData>>(
                this.config.hasJoinedUrl,
                { username, serverID },
            ),
        );
    }

    async profile(userUUID: string): Promise<ProfileResponseData> {
        return this.parseResponse(
            await HttpHelper.postJson<ApiResponse<ProfileResponseData>>(this.config.profileUrl, {
                userUUID,
            }),
        );
    }

    async profiles(usernames: string[]): Promise<ProfilesResponseData[]> {
        return this.parseResponse(
            await HttpHelper.postJson<ApiResponse<ProfilesResponseData[]>>(
                this.config.profilesUrl,
                { usernames },
            ),
        );
    }

    parseResponse<T>(response: ApiResponse<T>): T {
        if (response.success === true) return response.result;
        throw new Error(response.error);
    }
}

export interface JsonAuthProviderConfig extends AuthProviderConfig {
    authUrl: string;
    joinUrl: string;
    hasJoinedUrl: string;
    profileUrl: string;
    profilesUrl: string;
}

interface ApiResult<T> {
    success: true;
    result: T;
}

interface ApiError {
    success: false;
    error: string;
}

type ApiResponse<T> = ApiResult<T> | ApiError;
