import { LauncherServerConfig } from "@root/components/config/utils/LauncherServerConfig"
import { HttpHelper } from "@root/utils"

import {
    AuthProvider,
    AuthProviderConfig,
    AuthResponseData,
} from "./AuthProvider"

export class MojangAuthProvider implements AuthProvider {
    private authHost: string

    constructor({ auth }: LauncherServerConfig) {
        this.authHost =
            (<MojangAuthProviderConfig>auth).authHost ||
            "https://authserver.mojang.com"
    }

    async auth(username: string, password: string): Promise<AuthResponseData> {
        const result = await HttpHelper.postJson<AuthenticateResponse>(
            new URL("authenticate", this.authHost),
            {
                agent: {
                    name: "Minecraft",
                    version: 1,
                },
                username,
                password,
            }
        );

        return {
            username: result.selectedProfile.name,
            userUUID: result.selectedProfile.id,
            accessToken: result.accessToken,
        }
    }

    // These methods don't need implementation
    join(): void {}
    hasJoined(): void {}
    profile(): void {}
    privileges(): void {}
    profiles(): void {}
}

export interface MojangAuthProviderConfig extends AuthProviderConfig {
    authHost: string
    accountHost: string
    sessionHost: string
    servicesHost: string
}

interface AuthenticateResponse {
    user: {
        username: string
        properties: {
            name: string
            value: string
        }[]
        id: string
    }
    clientToken: string
    accessToken: string
    availableProfiles: [
        {
            name: string
            id: string
        }
    ]
    selectedProfile: {
        name: string
        id: string
    }
}
