import { AuthResponseData, HttpHelper } from "@aurora-launcher/core";
import { ResponseError } from "@aurora-rpc/server";
import { LauncherServerConfig } from "@root/components/config/utils/LauncherServerConfig";

import { AuthProvider, AuthProviderConfig } from "./AuthProvider";

export class YggdrasilAuthProvider implements AuthProvider {
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

            return {
                accessToken: response.accessToken,
                userUUID: response.selectedProfile.id,
                username: response.selectedProfile.name,
                refreshToken: response.clientToken,
                // capeUrl: ,
                // skinUrl: ,
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
