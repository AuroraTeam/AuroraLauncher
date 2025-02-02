import { AuthResponseData, HttpHelper, JsonHelper } from "@aurora-launcher/core";
import { ResponseError } from "@aurora-rpc/server";
import { LauncherServerConfig } from "@root/components/config/utils/LauncherServerConfig";

import { AuthProvider, AuthProviderConfig } from "./AuthProvider";
import { MojangTextures, SkinableAuthProvider } from "./SkinableAuthProvider";

export class YggdrasilAuthProvider implements AuthProvider, SkinableAuthProvider {
    private config: YggdrasilAuthProviderConfig;

    constructor(config: LauncherServerConfig) {
        this.config = <YggdrasilAuthProviderConfig>config.auth;
        if (!this.config.url) {
            throw new Error("Yggdrasil auth url not set");
        }
    }

    async auth(login: string, password: string): Promise<AuthResponseData> {
        try {
            const response = await HttpHelper.postJson<YggdrasilAuthResponseData>(
                this.config.url + "/authserver/authenticate",
                {
                    username: login,
                    password: password,
                },
            );

            if (response.error) {
                throw new ResponseError(response.errorMessage, 200);
            }

            const skinData = await this.getSkinData(response.selectedProfile.id);

            return {
                accessToken: response.accessToken,
                userUUID: response.selectedProfile.id,
                username: response.selectedProfile.name,
                refreshToken: response.clientToken,
                skinUrl: skinData.SKIN?.url,
                capeUrl: skinData.CAPE?.url,
            };
        } catch (error) {
            throw new ResponseError(error.message, 200);
        }
    }

    join(): never {
        throw new Error();
    }

    hasJoined(): never {
        throw new Error();
    }

    profile(): never {
        throw new Error();
    }

    profiles(): never {
        throw new Error();
    }

    async getSkinData(uuid: string) {
        let data: any;

        try {
            data = await HttpHelper.getResourceFromJson<any>(
                this.config.url + "/session/minecraft/profile/" + uuid,
            );
        } catch {
            return {};
        }

        const profile = JsonHelper.fromJson<MojangTextures>(
            Buffer.from(data.properties[0].value, "base64").toString("utf-8"),
        );

        return profile.textures;
    }
}

export interface YggdrasilAuthProviderConfig extends AuthProviderConfig {
    url: string;
}

interface YggdrasilAuthResponseData {
    error?: string;
    errorMessage?: string;
    accessToken: string;
    clientToken: string;
    selectedProfile: {
        id: string;
        name: string;
    };
}
