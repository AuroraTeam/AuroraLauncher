import { App } from "@root/app"
import { AbstractAuthProvider, AbstractAuthProviderConfig, AuthResponseData, HttpHelper } from "@root/utils"

export class MojangAuthProvider extends AbstractAuthProvider {
    static type = "mojang"
    private config: MojangAuthProviderConfig

    constructor() {
        super()
        const config = App.ConfigManager.config.auth as MojangAuthProviderConfig
        this.config = {
            type: "mojang",
            authHost: config.authHost || "https://authserver.mojang.com",
            accountHost: config.accountHost || "https://api.mojang.com",
            sessionHost: config.sessionHost || "https://sessionserver.mojang.com",
            servicesHost: config.servicesHost || "https://api.minecraftservices.com",
        }
    }

    async auth(username: string, password: string): Promise<AuthResponseData> {
        const result = await HttpHelper.makePostRequest<AuthenticateResponse>(
            new URL("authenticate", this.config.authHost),
            {
                agent: {
                    name: "Minecraft",
                    version: 1,
                },
                username,
                password,
            }
        )

        return {
            username: result.selectedProfile.name,
            userUUID: result.selectedProfile.id,
            accessToken: result.accessToken,
        }
    }

    join(): any {
        return // Doesn't need implementation
    }

    hasJoined(): any {
        return // Doesn't need implementation
    }

    profile(): any {
        return // Doesn't need implementation
    }

    privileges(): any {
        return // Doesn't need implementation
    }

    profiles(): any {
        return // Doesn't need implementation
    }
}

export interface MojangAuthProviderConfig extends AbstractAuthProviderConfig {
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
