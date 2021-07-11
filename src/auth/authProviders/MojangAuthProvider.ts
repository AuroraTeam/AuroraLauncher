import { HttpHelper } from "../../helpers/HttpHelper"
import { App } from "../../LauncherServer"
import { AbstractAuthProvider, AbstractAuthProviderConfig, AuthResponseData } from "./AbstractAuthProvider"

export class MojangAuthProvider extends AbstractAuthProvider {
    static type = "mojang"
    private config: MojangAuthProviderConfig

    constructor() {
        super()
        const config = App.ConfigManager.getConfig().auth.authProvider as MojangAuthProviderConfig
        this.config = {
            type: "mojang",
            authHost: config.authHost || "https://authserver.mojang.com",
            accountHost: config.accountHost || "https://api.mojang.com",
            sessionHost: config.sessionHost || "https://sessionserver.mojang.com",
            servicesHost: config.servicesHost || "https://api.minecraftservices.com",
        }
    }

    async auth(username: string, password: string): Promise<AuthResponseData> {
        const data = JSON.stringify({
            agent: {
                name: "Minecraft",
                version: 1,
            },
            username,
            password,
        })

        const result = await HttpHelper.makePostRequest(new URL("authenticate", this.config.authHost), data)

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

interface MojangAuthProviderConfig extends AbstractAuthProviderConfig {
    authHost: string
    accountHost: string
    sessionHost: string
    servicesHost: string
}
