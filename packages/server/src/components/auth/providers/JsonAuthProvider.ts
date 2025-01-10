import { AuthResponseData, HttpHelper } from "@aurora-launcher/core";
import { LauncherServerConfig } from "@root/components/config/utils/LauncherServerConfig";
import { ResponseError } from "aurora-rpc-server";

import {
    AuthProvider,
    AuthProviderConfig,
    HasJoinedResponseData,
    ProfileResponseData,
    ProfilesResponseData,
} from "./AuthProvider";
import { SkinManager } from "../../skin/SkinManager";

export class JsonAuthProvider implements AuthProvider {
    private config: JsonAuthProviderConfig;
    private skinManager: SkinManager;

    constructor({ auth }: LauncherServerConfig, skinManager: SkinManager) {
        this.config = <JsonAuthProviderConfig>auth;
        this.skinManager = skinManager;
    }

    async auth(login: string, password: string): Promise<AuthResponseData> {
        try {
            const response: ApiResponse<AuthResponseData> = await HttpHelper.postJson<ApiResponse<ApiAuthResponseData>>(this.config.authUrl, {
                login,
                password,
            });
            if (response.success === true) {
                response.result.capeUrl = this.skinManager.getCape(response.result.userUUID, response.result.username);
                response.result.skinUrl = this.skinManager.getSkin(response.result.userUUID, response.result.username);
            }
            return this.parseResponse(response);
        } catch (error) {
            throw new ResponseError(error.message, 200);
        }
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
        const response: ApiResponse<HasJoinedResponseData> = await HttpHelper.postJson<ApiResponse<ApiHasJoinedResponseData>>(
            this.config.hasJoinedUrl,
            { username, serverID },
        );
        if (response.success === true) {
            response.result.capeUrl = this.skinManager.getCape(response.result.userUUID, username);
            response.result.skinUrl = this.skinManager.getSkin(response.result.userUUID, username);
        }
        return this.parseResponse(response);
    }

    async profile(userUUID: string): Promise<ProfileResponseData> {
        const response: ApiResponse<ProfileResponseData> = await HttpHelper.postJson<ApiResponse<ApiProfileResponseData>>(this.config.profileUrl, {
            userUUID,
        });
        if (response.success === true) {
            response.result.capeUrl = this.skinManager.getCape(userUUID, response.result.username);
            response.result.skinUrl = this.skinManager.getSkin(userUUID, response.result.username);
        }
        return this.parseResponse(response);
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

interface ApiAuthResponseData {
    username: string
    userUUID: string
    accessToken: string
    token:string
}

interface ApiHasJoinedResponseData {
    userUUID: string;
}

interface ApiProfileResponseData {
    username: string;
}

type ApiResponse<T> = ApiResult<T> | ApiError;
