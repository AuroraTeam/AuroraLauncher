import { AuthResponseData, HttpHelper } from "@aurora-launcher/core";
import { LauncherServerConfig } from "@root/components/config/utils/LauncherServerConfig";

import {
    AuthProvider,
    AuthProviderConfig,
    HasJoinedResponseData,
    ProfileResponseData,
    ProfilesResponseData,
} from "./AuthProvider";
import { ResponseError } from "aurora-rpc-server";
import { SkinManager } from "../../skin/SkinManager";

export class YggdrasilAuthProvider implements AuthProvider {
    private skinManager: SkinManager;
    private config: YggdrasilAuthProviderConfig;

    constructor({ auth }: LauncherServerConfig, skinManager: SkinManager) {
        this.config = <YggdrasilAuthProviderConfig>auth;
        //const headers = HttpHelper.getHeaders(new URL("/authserver/refresh", conf.url));
        //headers.then(header => {
        //    console.log(header);
        //    if (header['x-authlib-injector-api-location']) this.config.url = header['x-authlib-injector-api-location'][0];
        //});
        this.skinManager = skinManager;
    }
    
    async auth(login: string, password: string): Promise<AuthResponseData> {
        try {
            const response = await HttpHelper.postJson(this.config.url + "/authserver/authenticate", {
                "username": login,
                "password": password,
            });
            let request: AuthResponseData = {};
            if (response.accessToken) {
                request.username = response.selectedProfile.name;
                request.userUUID = response.selectedProfile.id;
                request.accessToken = response.accessToken;
                request.capeUrl = this.skinManager.getCape(response.selectedProfile.id, response.selectedProfile.name);
                request.skinUrl = this.skinManager.getSkin(response.selectedProfile.id, response.selectedProfile.name);
            }
            if (response.error) {
                throw new ResponseError(response.errorMessage, 200);
            }
            return request;
        } catch (error) {
            throw new ResponseError(error.message, 200);
        }
    }

    async join(accessToken: string, userUUID: string, serverID: string): Promise<boolean> {
        return await HttpHelper.postJson<boolean>(this.config.url + "/sessionserver/session/minecraft/join", {
            accessToken,
            userUUID,
            serverID,
        })
    }

    async hasJoined(username: string, serverID: string): Promise<HasJoinedResponseData> {
        const response: HasJoinedResponseData = await HttpHelper.getResourceFromJson<ApiHasJoinedResponseData>(
            this.config.url + `/sessionserver/session/minecraft/hasJoined?username=${username}&serverId=${serverID}`
        );
        // TODO: Проверка ошибок API
        response.capeUrl = this.skinManager.getCape(response.userUUID, username);
        response.skinUrl = this.skinManager.getSkin(response.userUUID, username);
        console.log("1", response);
        return response;
    }

    async profile(userUUID: string): Promise<ProfileResponseData> {
        const response: ProfileResponseData = await HttpHelper.postJson<ApiProfileResponseData>(
            this.config.url + "/sessionserver/session/minecraft/profile", {
            userUUID,
        });
        // TODO: Проверка ошибок API
        response.capeUrl = this.skinManager.getCape(userUUID, response.username);
        response.skinUrl = this.skinManager.getSkin(userUUID, response.username);
        console.log("2", response);
        return response;
    }

    async profiles(usernames: string[]): Promise<ProfilesResponseData[]> {
        return await HttpHelper.postJson<ProfilesResponseData[]>(
            this.config.url + "/api/profiles/minecraft",
            { usernames },
        )
    }
}

interface YggdrasilAuthProviderConfig extends AuthProviderConfig {
    url: string;
}

interface ApiAuthResponseData {
    username: string;
    password: string;
}

interface ApiAuthRequestData {
    accessToken: string;
    clientToken: string;
    selectedProfile: {
        id: string;
        name: string;
    }
    availableProfiles: [{
        id: string;
        name: string;
    }]
}

interface ApiHasJoinedResponseData {
    userUUID: string;
}

interface ApiError {
    error: string;
    errorMessage: string;
}