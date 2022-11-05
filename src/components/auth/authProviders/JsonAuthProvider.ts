import {
    AbstractAuthProvider,
    AbstractAuthProviderConfig,
    AuthResponseData,
    HasJoinedResponseData,
    HttpHelper,
    PrivilegesResponseData,
    ProfileResponseData,
    ProfilesResponseData,
} from "@root/utils"

export class JsonAuthProvider extends AbstractAuthProvider {
    protected static readonly type = "json"

    private config = <JsonAuthProviderConfig>this.configManager.config.auth

    async auth(username: string, password: string): Promise<AuthResponseData> {
        return await HttpHelper.postJson<AuthResponseData>(
            new URL(this.config.authUrl),
            { username, password }
        )
    }

    async join(
        accessToken: string,
        userUUID: string,
        serverID: string
    ): Promise<boolean> {
        return await HttpHelper.postJson<boolean>(
            new URL(this.config.joinUrl),
            { accessToken, userUUID, serverID }
        )
    }

    async hasJoined(
        username: string,
        serverID: string
    ): Promise<HasJoinedResponseData> {
        return await HttpHelper.postJson<HasJoinedResponseData>(
            new URL(this.config.hasJoinedUrl),
            { username, serverID }
        )
    }

    async profile(userUUID: string): Promise<ProfileResponseData> {
        return await HttpHelper.postJson<ProfileResponseData>(
            new URL(this.config.profileUrl),
            { userUUID }
        )
    }

    async privileges(accessToken: string): Promise<PrivilegesResponseData> {
        return await HttpHelper.postJson<PrivilegesResponseData>(
            new URL(this.config.privilegesUrl),
            { accessToken }
        )
    }

    async profiles(userUUIDs: string[]): Promise<ProfilesResponseData[]> {
        return await HttpHelper.postJson<ProfilesResponseData[]>(
            new URL(this.config.profilesUrl),
            { userUUIDs }
        )
    }
}

export interface JsonAuthProviderConfig extends AbstractAuthProviderConfig {
    authUrl: string
    joinUrl: string
    hasJoinedUrl: string
    profileUrl: string
    privilegesUrl: string
    profilesUrl: string
}
