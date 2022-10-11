export abstract class AbstractAuthProvider {
    protected static type: string

    public static getType(): string {
        return this.type
    }

    public static getDefaultConfig(): AbstractAuthProviderConfig {
        return {
            type: "accept",
        }
    }

    abstract auth(username: string, password: string): PromiseOr<AuthResponseData>

    abstract join(accessToken: string, userUUID: string, serverID: string): PromiseOr<boolean>

    abstract hasJoined(username: string, serverID: string): PromiseOr<HasJoinedResponseData>

    abstract profile(userUUID: string): PromiseOr<ProfileResponseData>

    abstract privileges(accessToken: string): PromiseOr<PrivilegesResponseData>

    abstract profiles(userUUIDs: string[]): PromiseOr<ProfilesResponseData[]>
}

export interface AbstractAuthProviderConfig {
    type: string
}

export interface AuthResponseData {
    username: string
    userUUID: string
    accessToken: string
}

export interface HasJoinedResponseData {
    userUUID: string
    skinUrl?: string
    capeUrl?: string
}

export interface ProfileResponseData {
    username: string
    skinUrl?: string
    capeUrl?: string
}

export interface PrivilegesResponseData {
    onlineChat: boolean
    multiplayerServer: boolean
    multiplayerRealms: boolean
    telemetry: boolean
}

export interface ProfilesResponseData {
    id: string
    name: string
}
